/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import IO from 'koa-socket-2';
import type IOTypes from 'socket.io';
import type { ServerOptions as HttpsOptions } from 'https';
import PQueue from 'p-queue';
import { Master } from '../../master/master';
import type {
  TransportAPI as MasterTransport,
  TransportData,
} from '../../master/master';
import { getFilterPlayerView } from '../../master/filter-player-view';
import type { Game, Server } from '../../types';
import type { GenericPubSub } from './pubsub/generic-pub-sub';
import { PubSubChannelIdNamespace } from './pubsub/generic-pub-sub';
import type { IntermediateTransportData } from '../../master/master';
import { InMemoryPubSub } from './pubsub/in-memory-pub-sub';
import type { PubSubChannelId } from './pubsub/generic-pub-sub';

const PING_TIMEOUT = 20 * 1e3;
const PING_INTERVAL = 10 * 1e3;

/**
 * Emit a socket.io event to the recipientID.
 * If the recipient is the current socket, uses a basic emit, otherwise
 * emits via the current socket’s `to` method.
 */
const emit = (
  socket: IOTypes.Socket,
  recipientID: string,
  { type, args }: TransportData
) => {
  const emitter = socket.id === recipientID ? socket : socket.to(recipientID);
  emitter.emit(type, ...args);
};

function getPubSubChannelId(matchID: string): PubSubChannelId {
  return { namespace: PubSubChannelIdNamespace.MATCH, value: matchID };
}

/**
 * API that's exposed by SocketIO for the Master to send
 * information to the clients.
 */
export const TransportAPI = (
  matchID: string,
  socket: IOTypes.Socket,
  requestingClient: Client,
  filterPlayerView: any,
  pubSub: GenericPubSub<IntermediateTransportData>
): MasterTransport => {
  const send: MasterTransport['send'] = ({ playerID, ...data }) => {
    emit(socket, requestingClient.socket.id, filterPlayerView(playerID, data));
  };

  /**
   * Send a message to all clients.
   */
  const sendAll: MasterTransport['sendAll'] = (payload) => {
    pubSub.publish(getPubSubChannelId(matchID), payload);
  };

  return { send, sendAll };
};

export interface SocketOpts {
  https?: HttpsOptions;
  socketOpts?: IOTypes.ServerOptions;
  socketAdapter?: any;
  pubSub?: GenericPubSub<IntermediateTransportData>;
}

interface Client {
  matchID: string;
  playerID: string;
  socket: IOTypes.Socket;
  credentials: string | undefined;
}

/**
 * Transport interface that uses socket.io
 */
export class SocketIO {
  protected clientInfo: Map<string, Client>;
  protected roomInfo: Map<string, Set<string>>;
  protected perMatchQueue: Map<string, PQueue>;
  private readonly https: HttpsOptions;
  private readonly socketAdapter: any;
  private readonly socketOpts: IOTypes.ServerOptions;
  private readonly pubSub: GenericPubSub<IntermediateTransportData>;

  constructor({ https, socketAdapter, socketOpts, pubSub }: SocketOpts = {}) {
    this.clientInfo = new Map();
    this.roomInfo = new Map();
    this.perMatchQueue = new Map();
    this.https = https;
    this.socketAdapter = socketAdapter;
    this.socketOpts = socketOpts;
    this.pubSub = pubSub || new InMemoryPubSub();
  }

  /**
   * Unregister client data for a socket.
   */
  private removeClient(socketID: string): void {
    // Get client data for this socket ID.
    const client = this.clientInfo.get(socketID);
    if (!client) return;
    // Remove client from list of connected sockets for this match.
    const { matchID } = client;
    const matchClients = this.roomInfo.get(matchID);
    matchClients.delete(socketID);
    // If the match is now empty, delete its promise queue & client ID list.
    if (matchClients.size === 0) {
      this.unsubscribePubSubChannel(matchID);
      this.roomInfo.delete(matchID);
      this.deleteMatchQueue(matchID);
    }
    // Remove client data from the client map.
    this.clientInfo.delete(socketID);
  }

  /**
   * Register client data for a socket.
   */
  private addClient(client: Client, game: Game): void {
    const { matchID, socket } = client;
    // Add client to list of connected sockets for this match.
    let matchClients = this.roomInfo.get(matchID);
    if (matchClients === undefined) {
      this.subscribePubSubChannel(matchID, game);
      matchClients = new Set<string>();
      this.roomInfo.set(matchID, matchClients);
    }
    matchClients.add(socket.id);
    // Register data for this socket in the client map.
    this.clientInfo.set(socket.id, client);
  }

  private subscribePubSubChannel(matchID: string, game: Game) {
    this.pubSub
      .subscribe(getPubSubChannelId(matchID))
      .subscribe((payload: IntermediateTransportData) => {
        const clientIDs = this.roomInfo.get(matchID);
        if (clientIDs) {
          clientIDs.forEach((clientID) => {
            const client = this.clientInfo.get(clientID);
            const data = getFilterPlayerView(game)(client.playerID, payload);
            emit(client.socket, client.socket.id, data);
          });
        }
      });
  }

  private unsubscribePubSubChannel(matchID: string) {
    this.pubSub.unsubscribe(getPubSubChannelId(matchID));
  }

  init(
    app: Server.App & { _io?: IOTypes.Server },
    games: Game[],
    origins: IOTypes.ServerOptions['cors']['origin'] = []
  ) {
    const io = new IO({
      ioOptions: {
        pingTimeout: PING_TIMEOUT,
        pingInterval: PING_INTERVAL,
        cors: {
          origins,
        },
        ...this.socketOpts,
      },
    });

    app.context.io = io;
    io.attach(app, !!this.https, this.https);

    if (this.socketAdapter) {
      io.adapter(this.socketAdapter);
    }

    for (const game of games) {
      const nsp = app._io.of(game.name);
      const filterPlayerView = getFilterPlayerView(game);

      nsp.on('connection', (socket: IOTypes.Socket) => {
        socket.on('update', async (...args: Parameters<Master['onUpdate']>) => {
          const [action, stateID, matchID, playerID] = args;
          const credentials = action.payload.credentials;
          const requestingClient = { socket, matchID, playerID, credentials };
          const master = new Master(
            game,
            app.context.db,
            TransportAPI(
              matchID,
              socket,
              requestingClient,
              filterPlayerView,
              this.pubSub
            ),
            app.context.auth
          );

          const matchQueue = this.getMatchQueue(matchID);
          await matchQueue.add(() =>
            master.onUpdate(action, stateID, matchID, playerID)
          );
        });

        socket.on('sync', async (...args: Parameters<Master['onSync']>) => {
          const [matchID, playerID, credentials] = args;
          socket.join(matchID);
          this.removeClient(socket.id);
          const requestingClient = { socket, matchID, playerID, credentials };
          const transport = TransportAPI(
            matchID,
            socket,
            requestingClient,
            filterPlayerView,
            this.pubSub
          );
          const master = new Master(
            game,
            app.context.db,
            transport,
            app.context.auth
          );

          const syncResponse = await master.onSync(...args);
          if (syncResponse && syncResponse.error === 'unauthorized') {
            return;
          }
          this.addClient(requestingClient, game);
          await master.onConnectionChange(matchID, playerID, credentials, true);
        });

        socket.on('disconnect', async () => {
          const client = this.clientInfo.get(socket.id);
          this.removeClient(socket.id);
          if (client) {
            const { matchID, playerID, credentials } = client;
            const requestingClient = { socket, matchID, playerID, credentials };
            const master = new Master(
              game,
              app.context.db,
              TransportAPI(
                matchID,
                socket,
                requestingClient,
                filterPlayerView,
                this.pubSub
              ),
              app.context.auth
            );
            await master.onConnectionChange(
              matchID,
              playerID,
              credentials,
              false
            );
          }
        });

        socket.on(
          'chat',
          async (...args: Parameters<Master['onChatMessage']>) => {
            const [matchID, chatMessage, credentials] = args;
            const playerID = chatMessage.sender;
            const requestingClient = { socket, matchID, playerID, credentials };
            const master = new Master(
              game,
              app.context.db,
              TransportAPI(
                matchID,
                socket,
                requestingClient,
                filterPlayerView,
                this.pubSub
              ),
              app.context.auth
            );
            master.onChatMessage(...args);
          }
        );
      });
    }
  }

  /**
   * Create a PQueue for a given matchID if none exists and return it.
   * @param matchID
   * @returns
   */
  getMatchQueue(matchID: string): PQueue {
    if (!this.perMatchQueue.has(matchID)) {
      // PQueue should process only one action at a time.
      this.perMatchQueue.set(matchID, new PQueue({ concurrency: 1 }));
    }
    return this.perMatchQueue.get(matchID);
  }

  /**
   * Delete a PQueue for a given matchID.
   * @param matchID
   */
  deleteMatchQueue(matchID: string): void {
    this.perMatchQueue.delete(matchID);
  }
}
