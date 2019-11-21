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

function PackageJson(name) {
  return `{
  "name": "boardgame.io/${name}",
  "private": true,
  "main": "../dist/cjs/${name}.js",
  "module": "../dist/esm/${name}.js"
}
`;
}

subpackages.forEach(name => {
  const dir = path.resolve(__dirname, `../${name}`);
  mkdirSync(dir);
  writeFileSync(`${dir}/package.json`, PackageJson(name));
});

writeFileSync(
  path.resolve(__dirname, '../server.js'),
  "module.exports = require('./dist/server');"
);
