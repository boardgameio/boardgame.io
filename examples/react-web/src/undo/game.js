/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const UndoExample = {
  name: 'undo',

  setup: () => ({ moves: [] }),

  moves: {
    A: ({ G }) => {
      G.moves.push('A');
    },
    B: ({ G }) => {
      G.moves.push('B');
    },
  },
};

export default UndoExample;
