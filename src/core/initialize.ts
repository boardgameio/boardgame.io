/*
 * Copyright 2020 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ProcessGameConfig } from './game';
import * as plugins from '../plugins/main';
import type { Ctx, Game, PartialGameState, State } from '../types';

/**
 * Creates the initial game state.
 */
export function InitializeGame({
  game,
  numPlayers,
  setupData,
}: {
  game: Game;
  numPlayers?: number;
  setupData?: any;
}) {
  game = ProcessGameConfig(game);

  if (!numPlayers) {
    numPlayers = 2;
  }

  const ctx: Ctx = game.flow.ctx(numPlayers);

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
  state = plugins.Enhance(state, { game, playerID: undefined });

  const pluginAPIs = plugins.GetAPIs(state);
  state.G = game.setup({ ...pluginAPIs, ctx: state.ctx }, setupData);

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
  [initial] = plugins.FlushAndValidate(initial, { game });

  // Initialize undo stack.
  if (!game.disableUndo) {
    initial._undo = [
      {
        G: initial.G,
        ctx: initial.ctx,
        plugins: initial.plugins,
      },
    ];
  }

  return initial;
}
