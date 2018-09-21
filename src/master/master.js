/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CreateGameReducer } from '../core/reducer';
import { MAKE_MOVE, GAME_EVENT } from '../core/action-types';
import { createStore } from 'redux';
import * as logging from '../core/logger';

export function redactLog(redactedMoves, log, ctx, playerID) {
  if (redactedMoves === undefined) {
    return log;
  }

  return log.map(logEvent => {
    // filter for all other players and a spectator
    if (playerID !== null && +playerID === +logEvent.payload.playerID) {
      return logEvent;
    }

    // only filter moves
    if (logEvent.type !== 'MAKE_MOVE') {
      return logEvent;
    }

    const moveName = logEvent.payload.type;
    const config = redactedMoves[moveName];
    if (config === undefined) {
      // no definition for that move given => show
      return logEvent;
    }

    let filteredEvent = logEvent;
    if (config.showArgs === false) {
      const newPayload = {
        ...filteredEvent.payload,
        args: undefined,
        argsRedacted: true,
      };
      filteredEvent = { ...filteredEvent, payload: newPayload };
    }

    return filteredEvent;
  });
}

/**
 * Master
 *
 * Class that runs the game and maintains the authoritative state.
 * It uses the transportAPI to communicate with clients and the
 * storageAPI to communicate with the database.
 */
export class Master {
  constructor(game, storageAPI, transportAPI, isActionFromAuthenticPlayer) {
    this.game = game;
    this.storageAPI = storageAPI;
    this.transportAPI = transportAPI;
    this.isActionFromAuthenticPlayer = () => true;

    if (isActionFromAuthenticPlayer !== undefined) {
      this.isActionFromAuthenticPlayer = isActionFromAuthenticPlayer;
    }
  }

  /**
   * Called on each move / event made by the client.
   * Computes the new value of the game state and returns it
   * along with a deltalog.
   */
  async onUpdate(action, stateID, gameID, playerID) {
    let state = await this.storageAPI.get(gameID);

    if (state === undefined) {
      logging.error(`game not found, gameID=[${gameID}]`);
      return { error: 'game not found' };
    }

    const reducer = CreateGameReducer({
      game: this.game,
      numPlayers: state.ctx.numPlayers,
    });
    const store = createStore(reducer, state);

    const isActionAuthentic = await this.isActionFromAuthenticPlayer({
      action,
      db: this.storageAPI,
      gameID,
      playerID,
    });
    if (!isActionAuthentic) {
      return { error: 'unauthorized action' };
    }

    // Check whether the player is allowed to make the move.
    if (
      action.type == MAKE_MOVE &&
      !this.game.flow.canPlayerMakeMove(state.G, state.ctx, playerID)
    ) {
      logging.error(
        `move not processed - canPlayerMakeMove=false, playerID=[${playerID}]`
      );
      return;
    }

    // Check whether the player is allowed to call the event.
    if (
      action.type == GAME_EVENT &&
      !this.game.flow.canPlayerCallEvent(state.G, state.ctx, playerID)
    ) {
      logging.error(`event not processed - invalid playerID=[${playerID}]`);
      return;
    }

    if (state._stateID !== stateID) {
      logging.error(
        `invalid stateID, was=[${stateID}], expected=[${state._stateID}]`
      );
      return;
    }

    let log = store.getState().log || [];

    // Update server's version of the store.
    store.dispatch(action);
    state = store.getState();

    this.transportAPI.sendAll(playerID => {
      const filteredState = {
        ...state,
        G: this.game.playerView(state.G, state.ctx, playerID),
        ctx: { ...state.ctx, _random: undefined },
        log: undefined,
        deltalog: undefined,
      };

      const log = redactLog(
        this.game.flow.redactedMoves,
        state.deltalog,
        state.ctx,
        playerID
      );

      return {
        type: 'update',
        args: [gameID, filteredState, log],
      };
    });

    // TODO: We currently attach the log back into the state
    // object before storing it, but this should probably
    // sit in a different part of the database eventually.
    log = [...log, ...state.deltalog];
    const stateWithLog = { ...state, log };

    await this.storageAPI.set(gameID, stateWithLog);
  }

  /**
   * Called when the client connects / reconnects.
   * Returns the latest game state and the entire log.
   */
  async onSync(gameID, playerID, numPlayers) {
    const reducer = CreateGameReducer({ game: this.game, numPlayers });
    let state = await this.storageAPI.get(gameID);

    if (state === undefined) {
      const store = createStore(reducer);
      state = store.getState();
      await this.storageAPI.set(gameID, state);
    }

    const filteredState = {
      ...state,
      G: this.game.playerView(state.G, state.ctx, playerID),
      ctx: { ...state.ctx, _random: undefined },
      log: undefined,
      deltalog: undefined,
    };

    const log = redactLog(
      this.game.flow.redactedMoves,
      state.deltalog,
      state.ctx,
      playerID
    );

    this.transportAPI.send({
      playerID,
      type: 'sync',
      args: [gameID, filteredState, log],
    });

    return;
  }
}
