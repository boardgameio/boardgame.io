/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
import type { Game } from '../types';

describe('log-metadata', () => {
  test('It sets metadata in a move and then clears the metadata', () => {
    const game: Game = {
      moves: {
        setMetadataMove: ({ log }) => {
          log.setMetadata({
            message: 'test',
          });
        },
        doNothing: ({ G }) => G,
      },
    };
    const client = Client({ game });
    client.moves.setMetadataMove();

    expect(client.getState().plugins.log.data).toEqual({});
    expect(client.getState().log[0].metadata).toEqual({
      message: 'test',
    });

    client.moves.doNothing();

    expect(client.getState().plugins.log.data).toEqual({});
    expect(client.getState().log[1].metadata).toEqual(undefined);
  });
});
