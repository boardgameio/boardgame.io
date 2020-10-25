import { KoaServer, Server } from '../index';
import { SocketIO as SocketIOClient } from '../../client/transport/socketio';
import { LobbyClient } from '../../lobby/client';
import { Client, _ClientImpl } from '../../client/client';
import * as ActionCreators from '../../core/action-creators';
import { PlayerView } from '../../core/player-view';
import { Ctx, SyncInfo } from '../../types';
import { sync } from '../../core/action-creators';
import { CreateMatch } from '../api';
import { InMemory } from '../db/inmemory';

describe('simultaneous moves', async () => {
  const game = {
    name: 'test',
    setup: () => {
      const G = {
        players: {
          '0': {
            cards: ['card3'],
          },
          '1': {
            cards: [],
          },
        },
        cards: ['card0', 'card1', 'card2'],
        discardedCards: [],
      };
      return G;
    },
    playerView: PlayerView.STRIP_SECRETS,
    turn: {
      activePlayers: { currentPlayer: { stage: 'A' } },
      stages: {
        A: {
          moves: {
            A: (G, ctx: Ctx) => {
              const card = G.players[ctx.playerID].cards.shift();
              G.discardedCards.push(card);
            },
            B: {
              move: (G, ctx: Ctx) => {
                const card = G.cards.pop();
                G.players[ctx.playerID].cards.push(card);
              },
              ignoreStaleStateID: true,
            },
          },
        },
      },
    },
  };
  let server: ReturnType<typeof Server> | null;
  let runningServer: { appServer: KoaServer; apiServer?: KoaServer } | null;
  let clientConfig;
  let httpAppAddr;
  let client0: _ClientImpl<any>;
  let client1: _ClientImpl<any>;
  let lobbyClient: LobbyClient;

  beforeEach(async () => {
    server = Server({ games: [game], db: new InMemory() });
    runningServer = await server.run(undefined);
    httpAppAddr = runningServer.appServer.address();

    // lobbyClient = new LobbyClient({ server: `http://[${httpAppAddr.address}]:${httpAppAddr.port}` });

    clientConfig = {
      game: game,
      multiplayer: SocketIOClient({
        server: `http://127.0.0.1:${httpAppAddr.port}`,
        socketOpts: {
          forceNode: true,
          reconnectionDelay: 0,
          transports: ['websocket'],
        },
      }),
      numPlayers: 2,
      matchID: 'test',
    };

    // const match = await lobbyClient.createMatch('test', { numPlayers: 2 });

    // const p0Auth = await lobbyClient.joinMatch('test', match.matchID, {
    //   playerID: '0',
    //   playerName: 'Player 0',
    // });
    // const p1Auth = await lobbyClient.joinMatch('test', match.matchID, {
    //   playerID: '1',
    //   playerName: 'Player 1',
    // });

    client0 = Client({
      ...clientConfig,
      playerID: '0',
      // credentials: p0Auth.playerCredentials,
    });
    client1 = Client({
      ...clientConfig,
      playerID: '1',
      // credentials: p1Auth.playerCredentials,
    });

    // client0.updateMatchID('test');
    // client1.updateMatchID('test');

    client0.start();
    client1.start();

    // client0.updateMatchID(match.matchID);
    // client1.updateMatchID(match.matchID);

    // const state = { G: {}, ctx: { phase: '' }, plugins: {} };
    // const filteredMetadata = [];
    // client0.store.dispatch(sync({ state, filteredMetadata } as SyncInfo));
    // client1.store.dispatch(sync({ state, filteredMetadata } as SyncInfo));

    // const state = { restore: true };
    // const log = ['0', '1'];
    // const action = sync(({ state, log } as unknown) as SyncInfo);
    // client0.store.dispatch(action);
    // client1.store.dispatch(action);
  });

  afterEach(() => {
    if (server && runningServer) {
      const { apiServer, appServer } = runningServer;
      server.kill({ apiServer, appServer });
    }

    if (client0 && client0.stop) client0.stop();
    if (client1 && client1.stop) client1.stop();
  });

  test('two clients playing', async () => {
    expect(server).not.toBeUndefined();
    expect(runningServer.appServer).not.toBeUndefined();
    expect(runningServer.apiServer).toBeUndefined();

    // test: simultaneous moves
    client0.getInitialState();
    client1.getInitialState();

    client0.moves.A();
    client0.events.setActivePlayers({ all: 'A' });

    client1.moves.B();
    client0.moves.B();

    const stateP0 = client0.getState();
    const stateP1 = client1.getState();

    expect(stateP0.G).toMatchObject({
      players: {
        '0': {
          cards: ['card1'],
        },
      },
      cards: ['card0'],
      discardedCards: ['card3'],
    });
    expect(stateP1.G).toMatchObject({
      players: {
        '1': {
          cards: ['card2'],
        },
      },
      cards: ['card0'],
      discardedCards: ['card3'],
    });
  });
});
