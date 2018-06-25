/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { PostgreSQL } from './postgre';

test('PostgreSQL', async () => {
  let db = new PostgreSQL({ url: 'postgres://', cacheSize: 1000 });
  expect(db.db.getDialect()).toBe('postgres');
  db = new PostgreSQL({
    config: {
      database: 'postgres',
      username: 'user',
      password: 'password',
      host: 'localhost',
      port: 3307,
      pool: { max: 5, idle: 10000, acquire: 30000 },
    },
    cacheSize: 1000,
  });
  expect(db.db.getDialect()).toBe('postgres');
  expect(db.db.isDefined('game')).toBe(true);
});
