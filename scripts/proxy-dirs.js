/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const subpackages = require('../subpackages');
const path = require('path');
const { mkdirSync, writeFileSync } = require('fs');

function PackageJson(
  name,
  { mainDir = '../dist/cjs', includeModuleField = true } = {}
) {
  const pkg = {
    name: `boardgame.io/${name}`,
    private: true,
    types: `../dist/types/packages/${name}.d.ts`,
    main: `${mainDir}/${name}.js`,
  };
  if (includeModuleField) {
    pkg.module = `../dist/esm/${name}.js`;
  }
  return JSON.stringify(pkg, null, 2) + '\n';
}

function makeSubpackage(name, opts) {
  const dir = path.resolve(__dirname, `../${name}`);
  mkdirSync(dir);
  writeFileSync(`${dir}/package.json`, PackageJson(name, opts));
}

subpackages.forEach(name => makeSubpackage(name));
makeSubpackage('server', { mainDir: '../dist', includeModuleField: false });
