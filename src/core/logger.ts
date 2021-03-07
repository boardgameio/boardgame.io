/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const production = process.env.NODE_ENV === 'production';
const logfn = production ? () => {} : (...msg) => console.log(...msg);
const errorfn = (...msg) => console.error(...msg);

export function info(msg: string) {
  logfn(`INFO: ${msg}`);
}
export function error(error: string) {
  errorfn('ERROR:', error);
}
