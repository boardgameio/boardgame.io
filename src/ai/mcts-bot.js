/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
import { CreateGameReducer } from '../core/reducer';
import { Bot } from './bot';

/**
 * The number of iterations to run before yielding to
 * the JS event loop (in async mode).
 */
const CHUNK_SIZE = 25;

/**
 * Bot that uses Monte-Carlo Tree Search to find promising moves.
 */
export class MCTSBot extends Bot {
  constructor({
    enumerate,
    seed,
    objectives,
    game,
    iterations,
    playoutDepth,
    iterationCallback,
  }) {
    super({ enumerate, seed });

    if (objectives === undefined) {
      objectives = () => ({});
    }

    this.objectives = objectives;
    this.iterationCallback = iterationCallback || (() => {});
    this.reducer = CreateGameReducer({ game });
    this.iterations = iterations;
    this.playoutDepth = playoutDepth;

    this.addOpt({
      key: 'async',
      initial: false,
    });

    this.addOpt({
      key: 'iterations',
      initial: typeof iterations === 'number' ? iterations : 1000,
      range: { min: 1, max: 2000 },
    });

    this.addOpt({
      key: 'playoutDepth',
      initial: typeof playoutDepth === 'number' ? playoutDepth : 50,
      range: { min: 1, max: 100 },
    });
  }

  createNode({ state, parentAction, parent, playerID }) {
    const { G, ctx } = state;

    let actions = [];
    let objectives = [];

    if (playerID !== undefined) {
      actions = this.enumerate(G, ctx, playerID);
      objectives = this.objectives(G, ctx, playerID);
    } else if (ctx.activePlayers) {
      for (let playerID in ctx.activePlayers) {
        actions = actions.concat(this.enumerate(G, ctx, playerID));
        objectives = objectives.concat(this.objectives(G, ctx, playerID));
      }
    } else {
      actions = actions.concat(this.enumerate(G, ctx, ctx.currentPlayer));
      objectives = objectives.concat(
        this.objectives(G, ctx, ctx.currentPlayer)
      );
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

    let playoutDepth = this.getOpt('playoutDepth');
    if (typeof this.playoutDepth === 'function') {
      playoutDepth = this.playoutDepth(state.G, state.ctx);
    }

    for (let i = 0; i < playoutDepth && state.ctx.gameover === undefined; i++) {
      const { G, ctx } = state;
      let playerID = ctx.currentPlayer;
      if (ctx.activePlayers) {
        playerID = Object.keys(ctx.activePlayers)[0];
      }
      const moves = this.enumerate(G, ctx, playerID);

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

    let numIterations = this.getOpt('iterations');
    if (typeof this.iterations === 'function') {
      numIterations = this.iterations(state.G, state.ctx);
    }

    const getResult = () => {
      let selectedChild = null;
      for (const child of root.children) {
        if (selectedChild == null || child.visits > selectedChild.visits) {
          selectedChild = child;
        }
      }

      const action = selectedChild && selectedChild.parentAction;
      const metadata = root;
      return { action, metadata };
    };

    return new Promise(resolve => {
      const iteration = () => {
        for (
          let i = 0;
          i < CHUNK_SIZE && this.iterationCounter < numIterations;
          i++
        ) {
          const leaf = this.select(root);
          const child = this.expand(leaf);
          const result = this.playout(child);
          this.backpropagate(child, result);
          this.iterationCounter++;
        }
        this.iterationCallback({
          iterationCounter: this.iterationCounter,
          numIterations,
          metadata: root,
        });
      };

      this.iterationCounter = 0;

      if (this.getOpt('async')) {
        const asyncIteration = () => {
          if (this.iterationCounter < numIterations) {
            iteration();
            setTimeout(asyncIteration, 0);
          } else {
            resolve(getResult());
          }
        };
        asyncIteration();
      } else {
        while (this.iterationCounter < numIterations) {
          iteration();
        }
        resolve(getResult());
      }
    });
  }
}
