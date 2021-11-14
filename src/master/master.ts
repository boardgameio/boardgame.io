/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  CreateGameReducer,
  TransientHandlingMiddleware,
} from '../core/reducer';
import { ProcessGameConfig, IsLongFormMove } from '../core/game';
import { UNDO, REDO, MAKE_MOVE } from '../core/action-types';
import { createStore, applyMiddleware } from 'redux';
import * as logging from '../core/logger';
import type {
  SyncInfo,
  FilteredMetadata,
  Game,
  Server,
  State,
  ActionShape,
  CredentialedActionShape,
  LogEntry,
  PlayerID,
  ChatMessage,
} from '../types';
import { createMatch } from '../server/util';
import type { Auth } from '../server/auth';
import * as StorageAPI from '../server/db/base';
import type { Operation } from 'rfc6902';

/**
 * Filter match data to get a player metadata object with credentials stripped.
 */
const filterMatchData = (matchData: Server.MatchData): FilteredMetadata =>
  Object.values(matchData.players).map((player) => {
    const { credentials, ...filteredData } = player;
    return filteredData;
  });

/**
 * Remove player credentials from action payload
 */
const stripCredentialsFromAction = (action: CredentialedActionShape.Any) => {
  const { credentials, ...payload } = action.payload;
  return { ...action, payload };
};

type CallbackFn = (arg: {
  state: State;
  matchID: string;
  action?: ActionShape.Any | CredentialedActionShape.Any;
}) => void;

/**
 * Data types that are shared across `TransportData` and `IntermediateTransportData`.
 */
type CommonTransportData =
  | {
      type: 'sync';
      args: [string, SyncInfo];
    }
  | {
      type: 'matchData';
      args: [string, FilteredMetadata];
    }
  | {
      type: 'chat';
      args: [string, ChatMessage];
    };

/**
 * Final shape of data sent by the transport API
 * to be received by clients/client transports.
 */
export type TransportData =
  | {
      type: 'update';
      args: [string, State, LogEntry[]];
    }
  | {
      type: 'patch';
      args: [string, number, number, Operation[], LogEntry[]];
    }
  | CommonTransportData;

/**
 * Data type sent by a master to its transport API. The transport then transforms
 * this into `TransportData` for each individual player it forwards it to.
 */
export type IntermediateTransportData =
  | {
      type: 'update';
      args: [string, State];
    }
  | {
      type: 'patch';
      args: [string, number, State, State];
    }
  | CommonTransportData;

/** API used by a master to emit data to any connected clients/client transports. */
export interface TransportAPI {
  send: (
    playerData: { playerID: PlayerID } & IntermediateTransportData
  ) => void;
  sendAll: (payload: IntermediateTransportData) => void;
}

/**
 * Master
 *
 * Class that runs the game and maintains the authoritative state.
 * It uses the transportAPI to communicate with clients and the
 * storageAPI to communicate with the database.
 */
export class Master {
  game: ReturnType<typeof ProcessGameConfig>;
  storageAPI: StorageAPI.Sync | StorageAPI.Async;
  transportAPI: TransportAPI;
  subscribeCallback: CallbackFn;
  auth?: Auth;

  constructor(
    game: Game,
    storageAPI: StorageAPI.Sync | StorageAPI.Async,
    transportAPI: TransportAPI,
    auth?: Auth
  ) {
    this.game = ProcessGameConfig(game);
    this.storageAPI = storageAPI;
    this.transportAPI = transportAPI;
    this.subscribeCallback = () => {};
    this.auth = auth;
  }

  subscribe(fn: CallbackFn) {
    this.subscribeCallback = fn;
  }

  /**
   * Called on each move / event made by the client.
   * Computes the new value of the game state and returns it
   * along with a deltalog.
   */
  async onUpdate(
    credAction: CredentialedActionShape.Any,
    stateID: number,
    matchID: string,
    playerID: string
  ): Promise<void | { error: string }> {
    if (!credAction || !credAction.payload) {
      return { error: 'missing action or action payload' };
    }

    let metadata: Server.MatchData | undefined;
    if (StorageAPI.isSynchronous(this.storageAPI)) {
      ({ metadata } = this.storageAPI.fetch(matchID, { metadata: true }));
    } else {
      ({ metadata } = await this.storageAPI.fetch(matchID, { metadata: true }));
    }

    if (this.auth) {
      const isAuthentic = await this.auth.authenticateCredentials({
        playerID,
        credentials: credAction.payload.credentials,
        metadata,
      });
      if (!isAuthentic) {
        return { error: 'unauthorized action' };
      }
    }

    const action = stripCredentialsFromAction(credAction);
    const key = matchID;

    let state: State;
    if (StorageAPI.isSynchronous(this.storageAPI)) {
      ({ state } = this.storageAPI.fetch(key, { state: true }));
    } else {
      ({ state } = await this.storageAPI.fetch(key, { state: true }));
    }

    if (state === undefined) {
      logging.error(`game not found, matchID=[${key}]`);
      return { error: 'game not found' };
    }

    if (state.ctx.gameover !== undefined) {
      logging.error(
        `game over - matchID=[${key}] - playerID=[${playerID}]` +
          ` - action[${action.payload.type}]`
      );
      return;
    }

    const reducer = CreateGameReducer({
      game: this.game,
    });
    const middleware = applyMiddleware(TransientHandlingMiddleware);
    const store = createStore(reducer, state, middleware);

    // Only allow UNDO / REDO if there is exactly one player
    // that can make moves right now and the person doing the
    // action is that player.
    if (action.type == UNDO || action.type == REDO) {
      const hasActivePlayers = state.ctx.activePlayers !== null;
      const isCurrentPlayer = state.ctx.currentPlayer === playerID;

      if (
        // If activePlayers is empty, non-current players can’t undo.
        (!hasActivePlayers && !isCurrentPlayer) ||
        // If player is not active or multiple players are active, can’t undo.
        (hasActivePlayers &&
          (state.ctx.activePlayers[playerID] === undefined ||
            Object.keys(state.ctx.activePlayers).length > 1))
      ) {
        logging.error(`playerID=[${playerID}] cannot undo / redo right now`);
        return;
      }
    }

    // Check whether the player is active.
    if (!this.game.flow.isPlayerActive(state.G, state.ctx, playerID)) {
      logging.error(
        `player not active - playerID=[${playerID}]` +
          ` - action[${action.payload.type}]`
      );
      return;
    }

    // Get move for further checks
    const move =
      action.type == MAKE_MOVE
        ? this.game.flow.getMove(state.ctx, action.payload.type, playerID)
        : null;

    // Check whether the player is allowed to make the move.
    if (action.type == MAKE_MOVE && !move) {
      logging.error(
        `move not processed - canPlayerMakeMove=false - playerID=[${playerID}]` +
          ` - action[${action.payload.type}]`
      );
      return;
    }

    // Check if action's stateID is different than store's stateID
    // and if move does not have ignoreStaleStateID truthy.
    if (
      state._stateID !== stateID &&
      !(move && IsLongFormMove(move) && move.ignoreStaleStateID)
    ) {
      logging.error(
        `invalid stateID, was=[${stateID}], expected=[${state._stateID}]` +
          ` - playerID=[${playerID}] - action[${action.payload.type}]`
      );
      return;
    }

    const prevState = store.getState();

    // Update server's version of the store.
    store.dispatch(action);
    state = store.getState();

    this.subscribeCallback({
      state,
      action,
      matchID,
    });

    if (this.game.deltaState) {
      this.transportAPI.sendAll({
        type: 'patch',
        args: [matchID, stateID, prevState, state],
      });
    } else {
      this.transportAPI.sendAll({
        type: 'update',
        args: [matchID, state],
      });
    }

    const { deltalog, ...stateWithoutDeltalog } = state;

    let newMetadata: Server.MatchData | undefined;
    if (
      metadata &&
      (metadata.gameover === undefined || metadata.gameover === null)
    ) {
      newMetadata = {
        ...metadata,
        updatedAt: Date.now(),
      };
      if (state.ctx.gameover !== undefined) {
        newMetadata.gameover = state.ctx.gameover;
      }
    }

    if (StorageAPI.isSynchronous(this.storageAPI)) {
      this.storageAPI.setState(key, stateWithoutDeltalog, deltalog);
      if (newMetadata) this.storageAPI.setMetadata(key, newMetadata);
    } else {
      const writes = [
        this.storageAPI.setState(key, stateWithoutDeltalog, deltalog),
      ];
      if (newMetadata) {
        writes.push(this.storageAPI.setMetadata(key, newMetadata));
      }
      await Promise.all(writes);
    }
  }

  /**
   * Called when the client connects / reconnects.
   * Returns the latest game state and the entire log.
   */
  async onSync(
    matchID: string,
    playerID: string | null | undefined,
    credentials?: string,
    numPlayers = 2
  ): Promise<void | { error: string }> {
    const key = matchID;

    const fetchOpts = {
      state: true,
      metadata: true,
      log: true,
      initialState: true,
    } as const;

    const fetchResult = StorageAPI.isSynchronous(this.storageAPI)
      ? this.storageAPI.fetch(key, fetchOpts)
      : await this.storageAPI.fetch(key, fetchOpts);

    let { state, initialState, log, metadata } = fetchResult;

    if (this.auth && playerID !== undefined && playerID !== null) {
      const isAuthentic = await this.auth.authenticateCredentials({
        playerID,
        credentials,
        metadata,
      });
      if (!isAuthentic) {
        return { error: 'unauthorized' };
      }
    }

    // If the game doesn't exist, then create one on demand.
    // TODO: Move this out of the sync call.
    if (state === undefined) {
      const match = createMatch({
        game: this.game,
        unlisted: true,
        numPlayers,
        setupData: undefined,
      });

      if ('setupDataError' in match) {
        return { error: 'game requires setupData' };
      }

      initialState = state = match.initialState;
      metadata = match.metadata;

      this.subscribeCallback({ state, matchID });

      if (StorageAPI.isSynchronous(this.storageAPI)) {
        this.storageAPI.createMatch(key, { initialState, metadata });
      } else {
        await this.storageAPI.createMatch(key, { initialState, metadata });
      }
    }

    const filteredMetadata = metadata ? filterMatchData(metadata) : undefined;

    const syncInfo: SyncInfo = {
      state,
      log,
      filteredMetadata,
      initialState,
    };

    this.transportAPI.send({
      playerID,
      type: 'sync',
      args: [matchID, syncInfo],
    });

    return;
  }

  /**
   * Called when a client connects or disconnects.
   * Updates and sends out metadata to reflect the player’s connection status.
   */
  async onConnectionChange(
    matchID: string,
    playerID: string | null | undefined,
    credentials: string | undefined,
    connected: boolean
  ): Promise<void | { error: string }> {
    const key = matchID;

    // Ignore changes for clients without a playerID, e.g. spectators.
    if (playerID === undefined || playerID === null) {
      return;
    }

    let metadata: Server.MatchData | undefined;

    if (StorageAPI.isSynchronous(this.storageAPI)) {
      ({ metadata } = this.storageAPI.fetch(key, { metadata: true }));
    } else {
      ({ metadata } = await this.storageAPI.fetch(key, { metadata: true }));
    }

    if (metadata === undefined) {
      logging.error(`metadata not found for matchID=[${key}]`);
      return { error: 'metadata not found' };
    }

    if (metadata.players[playerID] === undefined) {
      logging.error(
        `Player not in the match, matchID=[${key}] playerID=[${playerID}]`
      );
      return { error: 'player not in the match' };
    }

    if (this.auth) {
      const isAuthentic = await this.auth.authenticateCredentials({
        playerID,
        credentials,
        metadata,
      });
      if (!isAuthentic) {
        return { error: 'unauthorized' };
      }
    }

    metadata.players[playerID].isConnected = connected;

    const filteredMetadata = filterMatchData(metadata);

    this.transportAPI.sendAll({
      type: 'matchData',
      args: [matchID, filteredMetadata],
    });

    if (StorageAPI.isSynchronous(this.storageAPI)) {
      this.storageAPI.setMetadata(key, metadata);
    } else {
      await this.storageAPI.setMetadata(key, metadata);
    }
  }

  async onChatMessage(
    matchID: string,
    chatMessage: ChatMessage,
    credentials: string | undefined
  ): Promise<void | { error: string }> {
    const key = matchID;

    if (this.auth) {
      const { metadata } = await (this.storageAPI as StorageAPI.Async).fetch(
        key,
        {
          metadata: true,
        }
      );
      if (!(chatMessage && typeof chatMessage.sender === 'string')) {
        return { error: 'unauthorized' };
      }
      const isAuthentic = await this.auth.authenticateCredentials({
        playerID: chatMessage.sender,
        credentials,
        metadata,
      });
      if (!isAuthentic) {
        return { error: 'unauthorized' };
      }
    }

    this.transportAPI.sendAll({
      type: 'chat',
      args: [matchID, chatMessage],
    });
  }
}
