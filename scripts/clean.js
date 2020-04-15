/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const shell = require('shelljs');
const subpackages = require('../subpackages');

shell.rm('-rf', 'dist');
shell.rm('-rf', subpackages);
shell.rm('-rf', 'server');
