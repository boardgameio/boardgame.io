/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { MySQL } from './mysql';

test('MySQL', async () => {
  let db = new MySQL({ url: 'mysql://', cacheSize: 1000 });
  expect(db.db.getDialect()).toBe('mysql');
  db = new MySQL({
    config: {
      database: 'mysql',
      username: 'user',
      password: 'password',
      host: 'localhost',
      port: 3307,
      pool: { max: 5, idle: 10000, acquire: 30000 },
    },
    cacheSize: 1000,
  });
  expect(db.db.getDialect()).toBe('mysql');
  expect(db.db.isDefined('game')).toBe(true);
});
