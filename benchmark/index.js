/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Benchmark from 'benchmark';
import Game from '../src/core/game';
import { InitializeGame, CreateGameReducer } from '../src/core/reducer';
import { makeMove, gameEvent } from '../src/core/action-creators';

const game = Game({
  moves: {
    A: G => G,
  },
  flow: {
    endGameIf: (G, ctx) => (G.victory ? ctx.currentPlayer : undefined),
  },
});

const reducer = CreateGameReducer({ game });
const state = InitializeGame({ game });

new Benchmark.Suite()
  .add('move', function() {
    reducer(state, makeMove('A'));
  })
  .add('endTurn', function() {
    reducer(state, gameEvent('endTurn'));
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
