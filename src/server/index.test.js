/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Server } from '.';
import Game from '../core/game';

const game = Game({ seed: 0 });

jest.mock('../core/logger', () => ({
  info: () => {},
  error: () => {},
}));

jest.mock('./api', () => ({
  createApiServer: () => ({
    listen: async () => {},
  }),
}));

jest.mock('koa', () => {
  return class {
    constructor() {
      this.context = {};
    }

    callback() {}
    async listen() {}
  };
});

test('basic', async () => {
  const server = Server({ games: [game] });
  await server.run();
  expect(server).not.toBe(undefined);
});

test('custom db implementation', async () => {
  const game = Game({});
  const db = {};
  const server = Server({ games: [game], db });
  expect(server.db).toBe(db);
});

test('custom transport implementation', async () => {
  const game = Game({});
  const transport = { init: jest.fn() };
  Server({ games: [game], transport });
  expect(transport.init).toBeCalled();
});
