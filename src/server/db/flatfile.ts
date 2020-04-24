import { KeyValue } from './keyvalue';

/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * FlatFile data storage.
 */
export class FlatFile extends KeyValue {
  constructor(nodePersistArgs: {
    dir: string;
    logging?: boolean;
    ttl?: boolean;
  }) {
    super(require('node-persist'), nodePersistArgs);
  }
}
