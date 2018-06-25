/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { SQLite } from './sqlite';

test('SQLite', async () => {
  let db = new SQLite({ path: 'somepath.db', cacheSize: 1000 });
  expect(db.db.getDialect()).toBe('sqlite');

  db = new SQLite({
    config: {
      database: 'sqlite',
      username: 'user',
      password: 'password',
      host: 'localhost',
      port: 3307,
      pool: { max: 5, idle: 10000, acquire: 30000 },
    },
    cacheSize: 1000,
  });
  expect(db.db.getDialect()).toBe('sqlite');

  db = new SQLite({
    config: {
      database: 'sqlite',
      username: 'user',
      password: 'password',
      host: 'localhost',
      storage: 'somepath.db',
      port: 3307,
      pool: { max: 5, idle: 10000, acquire: 30000 },
    },
    cacheSize: 1000,
  });
  expect(db.db.getDialect()).toBe('sqlite');
  expect(db.db.options.storage).toBe('somepath.db');
  expect(db.db.isDefined('game')).toBe(true);
});
