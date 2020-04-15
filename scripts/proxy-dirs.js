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

function PackageJson(name, { mainDir, esmDir } = {}) {
  const pkg = {
    name: `boardgame.io/${name}`,
    private: true,
    types: `../dist/types/packages/${name}.d.ts`,
    main: path.join(mainDir, `${name}.js`),
  };
  if (esmDir) {
    pkg.module = path.join(esmDir, `${name}.js`);
  }
  return JSON.stringify(pkg, null, 2) + '\n';
}

function makeSubpackage(name, opts) {
  const dir = path.resolve(__dirname, `../${name}`);
  mkdirSync(dir);
  writeFileSync(`${dir}/package.json`, PackageJson(name, opts));
}

subpackages.forEach(name => {
  makeSubpackage(name, { mainDir: '../dist/cjs', esmDir: '../dist/esm' });
});

makeSubpackage('server', { mainDir: '../dist' });
