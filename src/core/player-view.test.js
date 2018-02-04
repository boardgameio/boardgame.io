/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { PlayerView } from './player-view';

test('no change', () => {
  const G = { test: true };
  const newG = PlayerView.STRIP_SECRETS(G);
  expect(newG).toEqual(G);
});

test('secret', () => {
  const G = { secret: true };
  const newG = PlayerView.STRIP_SECRETS(G);
  expect(newG).toEqual({});
});

test('players', () => {
  const G = {
    players: {
      '0': {},
      '1': {},
    },
  };

  {
    const newG = PlayerView.STRIP_SECRETS(G, {}, '0');
    expect(newG.players).toEqual({ '0': {} });
  }

  {
    const newG = PlayerView.STRIP_SECRETS(G, {}, '1');
    expect(newG.players).toEqual({ '1': {} });
  }
});
