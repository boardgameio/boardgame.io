/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Benchmark from 'benchmark';
import { Client } from '../dist/esm/client';
import { InitializeGame } from '../src/core/initialize';
import { CreateGameReducer } from '../src/core/reducer';
import { makeMove, gameEvent } from '../src/core/action-creators';

const game = {
  moves: {
    A: ({ G }) => G,
  },
  endIf: () => false,
};

const reducer = CreateGameReducer({ game });
const state = InitializeGame({ game });
const client = Client({ game });

new Benchmark.Suite()
  .add('reducer::makeMove', function () {
    reducer(state, makeMove('A'));
  })
  .add('reducer::endTurn', function () {
    reducer(state, gameEvent('endTurn'));
  })
  .add('client::move', function () {
    client.moves.A();
  })
  .add('client::endTurn', function () {
    client.events.endTurn();
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
