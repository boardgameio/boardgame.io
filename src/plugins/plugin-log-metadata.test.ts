/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Client } from '../client/client';
import PluginLogMetadata from './plugin-log-metadata';

describe('log-metadata', () => {
  test('It sets metadata in a move and then clears the metadata', () => {
    const plugin = PluginLogMetadata;
    const game = {
      moves: {
        setMetadataMove: (G, ctx) => {
          ctx.log.setMetadata({
            message: 'test',
          });
        },
        doNothing: (G, ctx) => {
          return G;
        },
      },
      plugins: [plugin],
    };
    const client = Client({ game });
    client.moves.setMetadataMove();

    expect(client.getState().plugins[plugin.name].data).toEqual({});
    expect(client.getState().log[0].metadata).toEqual({
      message: 'test',
    });

    client.moves.doNothing();

    expect(client.getState().plugins[plugin.name].data).toEqual({});
    expect(client.getState().log[1].metadata).toEqual(undefined);
  });
});
