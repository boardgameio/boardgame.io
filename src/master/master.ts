/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { InitializeGame } from '../core/initialize';
import { CreateGameReducer } from '../core/reducer';
import { ProcessGameConfig } from '../core/game';
import { UNDO, REDO, MAKE_MOVE } from '../core/action-types';
import { createStore } from 'redux';
import * as logging from '../core/logger';
import {
  SyncInfo,
  FilteredMetadata,
  Game,
  Server,
  State,
  ActionShape,
  CredentialedActionShape,
  LogEntry,
  PlayerID,
} from '../types';
import { createMetadata } from '../server/util';
import * as StorageAPI from '../server/db/base';

export const getPlayerMetadata = (
  matchData: Server.MatchData,
  playerID: PlayerID
) => {
  if (matchData && matchData.players) {
    return matchData.players[playerID];
  }
};

function IsSynchronous(
  storageAPI: StorageAPI.Sync | StorageAPI.Async
): storageAPI is StorageAPI.Sync {
  return storageAPI.type() === StorageAPI.Type.SYNC;
}

/**
 * Redact the log.
 *
 * @param {Array} log - The game log (or deltalog).
 * @param {String} playerID - The playerID that this log is
 *                            to be sent to.
 */
export function redactLog(log: LogEntry[], playerID: PlayerID) {
  if (log === undefined) {
    return log;
  }

  return log.map(logEvent => {
    // filter for all other players and spectators.
    if (playerID !== null && +playerID === +logEvent.action.payload.playerID) {
      return logEvent;
    }

    if (logEvent.redact !== true) {
      return logEvent;
    }

    const payload = {
      ...logEvent.action.payload,
      args: null,
    };
    const filteredEvent = {
      ...logEvent,
      action: { ...logEvent.action, payload },
    };

    /* eslint-disable-next-line no-unused-vars */
    const { redact, ...remaining } = filteredEvent;
    return remaining;
  });
}

/**
 * Verifies that the match has metadata and is using credentials.
 */
export const doesMatchRequireAuthentication = (
  matchData?: Server.MatchData
) => {
  if (!matchData) return false;
  const { players } = matchData as Server.MatchData;
  const hasCredentials = Object.keys(players).some(key => {
    return !!(players[key] && players[key].credentials);
  });
  return hasCredentials;
};

/**
 * Verifies that the move came from a player with the correct credentials.
 */
export const isActionFromAuthenticPlayer = (
  actionCredentials: string,
  playerMetadata?: Server.PlayerMetadata
) => {
  if (!actionCredentials) return false;
  if (!playerMetadata) return false;
  return actionCredentials === playerMetadata.credentials;
};

/**
 * Remove player credentials from action payload
 */
const stripCredentialsFromAction = (action: CredentialedActionShape.Any) => {
  // eslint-disable-next-line no-unused-vars
  const { credentials, ...payload } = action.payload;
  return { ...action, payload };
};

export type AuthFn = (
  actionCredentials: string,
  playerMetadata: Server.PlayerMetadata
) => boolean | Promise<boolean>;

type CallbackFn = (arg: {
  state: State;
  matchID: string;
  action?: ActionShape.Any | CredentialedActionShape.Any;
}) => void;

type TransportData =
  | {
      type: 'update';
      args: [string, State, LogEntry[]];
    }
  | {
      type: 'sync';
      args: [string, SyncInfo];
    };

export interface TransportAPI {
  send: (playerData: { playerID: PlayerID } & TransportData) => void;
  sendAll: (makePlayerData: (playerID: PlayerID) => TransportData) => void;
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
  auth: null | AuthFn;
  shouldAuth: typeof doesMatchRequireAuthentication;

  constructor(
    game: Game,
    storageAPI: StorageAPI.Sync | StorageAPI.Async,
    transportAPI: TransportAPI,
    auth?: AuthFn | boolean
  ) {
    this.game = ProcessGameConfig(game);
    this.storageAPI = storageAPI;
    this.transportAPI = transportAPI;
    this.auth = null;
    this.subscribeCallback = () => {};
    this.shouldAuth = () => false;

    if (auth === true) {
      this.auth = isActionFromAuthenticPlayer;
      this.shouldAuth = doesMatchRequireAuthentication;
    } else if (typeof auth === 'function') {
      this.auth = auth;
      this.shouldAuth = () => true;
    }
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
  ) {
    let isActionAuthentic;
    let metadata: Server.MatchData | undefined;
    const credentials = credAction.payload.credentials;
    if (IsSynchronous(this.storageAPI)) {
      ({ metadata } = this.storageAPI.fetch(matchID, { metadata: true }));
      const playerMetadata = getPlayerMetadata(metadata, playerID);
      isActionAuthentic = this.shouldAuth(metadata)
        ? this.auth(credentials, playerMetadata)
        : true;
    } else {
      ({ metadata } = await this.storageAPI.fetch(matchID, {
        metadata: true,
      }));
      const playerMetadata = getPlayerMetadata(metadata, playerID);
      isActionAuthentic = this.shouldAuth(metadata)
        ? await this.auth(credentials, playerMetadata)
        : true;
    }
    if (!isActionAuthentic) {
      return { error: 'unauthorized action' };
    }

    let action = stripCredentialsFromAction(credAction);
    const key = matchID;

    let state: State;
    if (IsSynchronous(this.storageAPI)) {
      ({ state } = this.storageAPI.fetch(key, { state: true }));
    } else {
      ({ state } = await this.storageAPI.fetch(key, { state: true }));
    }

    if (state === undefined) {
      logging.error(`game not found, matchID=[${key}]`);
      return { error: 'game not found' };
    }

    if (state.ctx.gameover !== undefined) {
      logging.error(`game over - matchID=[${key}]`);
      return;
    }

    const reducer = CreateGameReducer({
      game: this.game,
    });
    const store = createStore(reducer, state);

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
      logging.error(`player not active - playerID=[${playerID}]`);
      return;
    }

    // Check whether the player is allowed to make the move.
    if (
      action.type == MAKE_MOVE &&
      !this.game.flow.getMove(state.ctx, action.payload.type, playerID)
    ) {
      logging.error(
        `move not processed - canPlayerMakeMove=false, playerID=[${playerID}]`
      );
      return;
    }

    if (state._stateID !== stateID) {
      logging.error(
        `invalid stateID, was=[${stateID}], expected=[${state._stateID}]`
      );
      return;
    }

    // Update server's version of the store.
    store.dispatch(action);
    state = store.getState();

    this.subscribeCallback({
      state,
      action,
      matchID,
    });

    this.transportAPI.sendAll((playerID: string) => {
      const filteredState = {
        ...state,
        G: this.game.playerView(state.G, state.ctx, playerID),
        deltalog: undefined,
        _undo: [],
        _redo: [],
      };

      const log = redactLog(state.deltalog, playerID);

      return {
        type: 'update',
        args: [matchID, filteredState, log],
      };
    });

    const { deltalog, ...stateWithoutDeltalog } = state;

    let newMetadata: Server.MatchData | undefined;
    if (metadata && !('gameover' in metadata)) {
      newMetadata = {
        ...metadata,
        updatedAt: Date.now(),
      };
      if (state.ctx.gameover !== undefined) {
        newMetadata.gameover = state.ctx.gameover;
      }
    }

    if (IsSynchronous(this.storageAPI)) {
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
  async onSync(matchID: string, playerID: string, numPlayers = 2) {
    const key = matchID;

    const fetchOpts = {
      state: true,
      metadata: true,
      log: true,
      initialState: true,
    } as const;

    let fetchResult: StorageAPI.FetchResult<typeof fetchOpts>;

    if (IsSynchronous(this.storageAPI)) {
      fetchResult = this.storageAPI.fetch(key, fetchOpts);
    } else {
      fetchResult = await this.storageAPI.fetch(key, fetchOpts);
    }

    let { state, initialState, log, metadata } = fetchResult;

    // If the game doesn't exist, then create one on demand.
    // TODO: Move this out of the sync call.
    if (state === undefined) {
      initialState = state = InitializeGame({ game: this.game, numPlayers });
      metadata = createMetadata({
        game: this.game,
        unlisted: true,
        numPlayers,
      });

      this.subscribeCallback({ state, matchID });

      if (IsSynchronous(this.storageAPI)) {
        this.storageAPI.createMatch(key, { initialState, metadata });
      } else {
        await this.storageAPI.createMatch(key, { initialState, metadata });
      }
    }

    let filteredMetadata: FilteredMetadata;
    if (metadata) {
      filteredMetadata = Object.values(metadata.players).map(player => {
        const { credentials, ...filteredData } = player;
        return filteredData;
      });
    }

    const filteredState = {
      ...state,
      G: this.game.playerView(state.G, state.ctx, playerID),
      deltalog: undefined,
      _undo: [],
      _redo: [],
    };

    log = redactLog(log, playerID);

    const syncInfo: SyncInfo = {
      state: filteredState,
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
}
