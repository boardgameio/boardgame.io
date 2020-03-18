import { Game } from './game';
import { GameConfig } from '../types';
import * as plugins from '../plugins/main';
import { GameState, State, Ctx } from '../types';

/**
 * InitializeGame
 *
 * Creates the initial game state.
 *
 * @param {...object} game - Return value of Game().
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to true if we are in a multiplayer client.
 */
export function InitializeGame({
  game,
  numPlayers,
  setupData,
}: {
  game: GameConfig;
  numPlayers: number;
  setupData?: any;
}) {
  game = Game(game);

  if (!numPlayers) {
    numPlayers = 2;
  }

  let ctx: Ctx = game.flow.ctx(numPlayers);

  let state: GameState = {
    // User managed state.
    G: {},
    // Framework managed state.
    ctx,
    // Plugin related state.
    plugins: {},
  };

  // Run plugins over initial state.
  state = plugins.Setup(state, { game });
  state = plugins.Enhance(state as State, { game });

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
