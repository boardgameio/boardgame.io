import { parse, stringify } from 'flatted';
import { Random } from './random';
import { Game } from './game';
import * as plugins from '../plugins/main';
import { ContextEnhancer } from './context-enhancer';

/**
 * InitializeGame
 *
 * Creates the initial game state.
 *
 * @param {...object} game - Return value of Game().
 * @param {...object} numPlayers - The number of players.
 * @param {...object} multiplayer - Set to true if we are in a multiplayer client.
 */
export function InitializeGame({ game, numPlayers, setupData }) {
  game = Game(game);

  if (!numPlayers) {
    numPlayers = 2;
  }

  let ctx = game.flow.ctx(numPlayers);

  let seed = game.seed;
  if (seed === undefined) {
    seed = Random.seed();
  }
  ctx._random = { seed };

  // Pass ctx through all the plugins that want to modify it.
  ctx = plugins.ctx.setup(ctx, game);

  // Augment ctx with the enhancers (TODO: move these into plugins).
  const apiCtx = new ContextEnhancer(ctx, game, ctx.currentPlayer);
  let ctxWithAPI = apiCtx.attachToContext(ctx);

  let initialG = game.setup(ctxWithAPI, setupData);

  // Pass G through all the plugins that want to modify it.
  initialG = plugins.G.setup(initialG, ctxWithAPI, game);

  const initial = {
    // User managed state.
    G: initialG,
    // Framework managed state.
    ctx: ctx,
    // List of {G, ctx} pairs that can be undone.
    _undo: [],
    // List of {G, ctx} pairs that can be redone.
    _redo: [],
    // A monotonically non-decreasing ID to ensure that
    // state updates are only allowed from clients that
    // are at the same version that the server.
    _stateID: 0,
    // A snapshot of this object so that actions can be
    // replayed over it to view old snapshots.
    // TODO: This will no longer be necessary once the
    // log stops replaying actions (but reads the actual
    // game states instead).
    _initial: {},
  };

  let state = game.flow.init({ G: initial.G, ctx: ctxWithAPI });

  initial.G = state.G;
  initial._undo = state._undo;
  state = apiCtx.updateAndDetach(state, true);
  initial.ctx = state.ctx;
  const deepCopy = obj => parse(stringify(obj));
  initial._initial = deepCopy(initial);

  return initial;
}
