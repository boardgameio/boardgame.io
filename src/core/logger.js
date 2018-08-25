/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const DEV =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV == 'test';
const logfn = DEV ? console.log : () => {};

export function info(msg) {
  logfn(`INFO: ${msg}`);
}
export function error(msg) {
  logfn(`ERROR: ${msg}`);
}
