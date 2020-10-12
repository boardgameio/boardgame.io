/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { AssignShortcuts } from './shortcuts';

test('first char is used', () => {
  const moves = {
    clickCell: () => {},
    playCard: () => {},
  };

  const shortcuts = AssignShortcuts(moves, '');

  expect(shortcuts).toEqual({
    clickCell: 'c',
    playCard: 'p',
  });
});

test('a-z if cannot use first char', () => {
  const moves = {
    takeCard: () => {},
    takeToken: () => {},
  };

  const shortcuts = AssignShortcuts(moves, '');

  expect(shortcuts).toEqual({
    takeCard: 'a',
    takeToken: 'b',
  });
});

test('a-z if blacklist prevents using first char', () => {
  const moves = {
    clickCell: () => {},
  };

  const shortcuts = AssignShortcuts(moves, 'c');

  expect(shortcuts).toEqual({
    clickCell: 'a',
  });
});
