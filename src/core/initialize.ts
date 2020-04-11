/*
 * Copyright 2020 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ProcessGameConfig } from './game';
import { Game } from '../types';
import * as plugins from '../plugins/main';
import { PartialGameState, State, Ctx } from '../types';

/**
 * Creates the initial game state.
 */
export function InitializeGame({
  game,
  numPlayers,
  setupData,
}: {
  game: Game;
  numPlayers: number;
  setupData?: any;
}) {
  game = ProcessGameConfig(game);

  if (!numPlayers) {
    numPlayers = 2;
  }

  let ctx: Ctx = game.flow.ctx(numPlayers);

  let state: PartialGameState = {
    // User managed state.
    G: {},
    // Framework managed state.
    ctx,
    // Plugin related state.
    plugins: {},
  };

  // Run plugins over initial state.
  state = plugins.Setup(state, { game });
  state = plugins.Enhance(state as State, { game, playerID: undefined });

  const enhancedCtx = plugins.EnhanceCtx(state);
  state.G = game.setup(enhancedCtx, setupData);

  let initial: State = {
    ...state,

    // List of {G, ctx} pairs that can be undone.
    _undo: [],
    // List of {G, ctx} pairs that can be redone.
    _redo: [],
    // A monotonically non-decreasing ID to ensure that
    // state updates are only allowed from clients that
    // are at the same version that the server.
    _stateID: 0,
  };

  initial = game.flow.init(initial);
  initial = plugins.Flush(initial, { game });

  return initial;
}
