/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CreateGameReducer } from '../core/reducer';
import { makeMove, gameEvent } from '../core/action-creators';
import { alea } from '../core/random.alea';

/**
 * Simulates the game till the end or a max depth.
 *
 * @param {...object} game - The game object.
 * @param {...object} bots - An array of bots.
 * @param {...object} state - The game state to start from.
 */
export function Simulate({ game, bots, state, depth }) {
  if (depth === undefined) depth = 10000;
  const reducer = CreateGameReducer({ game, numPlayers: state.ctx.numPlayers });

  let metadata = null;
  let iter = 0;
  while (
    state.ctx.gameover === undefined &&
    state.ctx.actionPlayers.length > 0 &&
    iter < depth
  ) {
    const playerID = state.ctx.actionPlayers[0];
    const bot = bots instanceof Bot ? bots : bots[playerID];
    const t = bot.play(state, playerID);

    if (!t.action) {
      break;
    }

    metadata = t.metadata;
    state = reducer(state, t.action);
    iter++;
  }

  return { state, metadata };
}

export class Bot {
  constructor({ enumerate, seed }) {
    this.enumerateFn = enumerate;
    this.seed = seed;
  }

  enumerate = (G, ctx, playerID) => {
    const actions = this.enumerateFn(G, ctx, playerID);
    return actions.map(a => {
      if (a.payload !== undefined) {
        return a;
      }

      if (a.move !== undefined) {
        return makeMove(a.move, a.args, playerID);
      }

      if (a.event !== undefined) {
        return gameEvent(a.event, a.args, playerID);
      }
    });
  };

  random(arg) {
    let number;

    if (this.seed !== undefined) {
      let r = null;
      if (this.prngstate) {
        r = new alea('', { state: this.prngstate });
      } else {
        r = new alea(this.seed, { state: true });
      }

      number = r();
      this.prngstate = r.state();
    } else {
      number = Math.random();
    }

    if (arg) {
      // eslint-disable-next-line unicorn/explicit-length-check
      if (arg.length) {
        const id = Math.floor(number * arg.length);
        return arg[id];
      } else {
        return Math.floor(number * arg);
      }
    }

    return number;
  }
}

export class RandomBot extends Bot {
  play({ G, ctx }, playerID) {
    const moves = this.enumerate(G, ctx, playerID);
    return { action: this.random(moves) };
  }
}

export class MCTSBot extends Bot {
  constructor({ enumerate, seed, objectives, game, iterations, playoutDepth }) {
    super({ enumerate, seed });

    if (objectives === undefined) {
      objectives = () => ({});
    }

    this.objectives = objectives;
    this.reducer = CreateGameReducer({ game });
    this.iterations = iterations || 1000;
    this.playoutDepth = playoutDepth || 50;
  }

  createNode({ state, parentAction, parent, playerID }) {
    const { G, ctx } = state;

    let actions = [];
    let objectives = [];

    if (playerID !== undefined) {
      actions = this.enumerate(G, ctx, playerID);
      objectives = this.objectives(G, ctx, playerID);
    } else {
      for (let playerID of ctx.actionPlayers) {
        actions = actions.concat(this.enumerate(G, ctx, playerID));
        objectives = objectives.concat(this.objectives(G, ctx, playerID));
      }
    }

    return {
      // Game state at this node.
      state,
      // Parent of the node.
      parent,
      // Move used to get to this node.
      parentAction,
      // Unexplored actions.
      actions,
      // Current objectives.
      objectives,
      // Children of the node.
      children: [],
      // Number of simulations that pass through this node.
      visits: 0,
      // Number of wins for this node.
      value: 0,
    };
  }

  select(node) {
    // This node has unvisited children.
    if (node.actions.length > 0) {
      return node;
    }

    // This is a terminal node.
    if (node.children.length == 0) {
      return node;
    }

    let selectedChild = null;
    let best = 0.0;

    for (const child of node.children) {
      const childVisits = child.visits + Number.EPSILON;
      const uct =
        child.value / childVisits +
        Math.sqrt((2 * Math.log(node.visits)) / childVisits);
      if (selectedChild == null || uct > best) {
        best = uct;
        selectedChild = child;
      }
    }

    return this.select(selectedChild);
  }

  expand(node) {
    const actions = node.actions;

    if (actions.length == 0 || node.state.ctx.gameover !== undefined) {
      return node;
    }

    const id = this.random(actions.length);
    const action = actions[id];
    node.actions.splice(id, 1);
    const childState = this.reducer(node.state, action);
    const childNode = this.createNode({
      state: childState,
      parentAction: action,
      parent: node,
    });
    node.children.push(childNode);
    return childNode;
  }

  playout(node) {
    let state = node.state;

    for (
      let i = 0;
      i < this.playoutDepth && state.ctx.gameover === undefined;
      i++
    ) {
      const { G, ctx } = state;
      const moves = this.enumerate(G, ctx, ctx.actionPlayers[0]);

      // Check if any objectives are met.
      const objectives = this.objectives(G, ctx);
      const score = Object.keys(objectives).reduce((score, key) => {
        const objective = objectives[key];
        if (objective.checker(G, ctx)) {
          return score + objective.weight;
        }
        return score;
      }, 0.0);

      // If so, stop and return the score.
      if (score > 0) {
        return { score };
      }

      if (!moves || moves.length == 0) {
        return undefined;
      }

      const id = this.random(moves.length);
      const childState = this.reducer(state, moves[id]);
      state = childState;
    }

    return state.ctx.gameover;
  }

  backpropagate(node, result = {}) {
    node.visits++;

    if (result.score !== undefined) {
      node.value += result.score;
    }

    if (result.draw === true) {
      node.value += 0.5;
    }

    if (
      node.parentAction &&
      result.winner === node.parentAction.payload.playerID
    ) {
      node.value++;
    }

    if (node.parent) {
      this.backpropagate(node.parent, result);
    }
  }

  play(state, playerID) {
    const root = this.createNode({ state, playerID });

    for (let i = 0; i < this.iterations; i++) {
      const leaf = this.select(root);
      const child = this.expand(leaf);
      const result = this.playout(child);
      this.backpropagate(child, result);
    }

    let selectedChild = null;
    for (const child of root.children) {
      if (selectedChild == null || child.visits > selectedChild.visits) {
        selectedChild = child;
      }
    }

    const action = selectedChild && selectedChild.parentAction;
    const metadata = root;

    return { action, metadata };
  }
}
