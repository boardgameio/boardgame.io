/*
 * Copyright 2019 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const path = require('path');
const { spawnSync } = require('child_process');
const { existsSync } = require('fs');

const projectRoot = path.resolve(__dirname, '../');
const webExamplePath = path.resolve(projectRoot, './examples/react-web');
const modulesPath = path.resolve(webExamplePath, './node_modules');

const hasModules = existsSync(modulesPath);

if (!hasModules) {
  installDependencies();
}

console.log('Starting the application...');

function installDependencies() {
  const isWindowsOs = process.platform === 'win32';
  const npmCommand = isWindowsOs ? 'npm.cmd' : 'npm';

  console.log('Installing web dependencies...');

  spawnSync(npmCommand, ['install'], {
    cwd: webExamplePath,
    stdio: 'inherit',
  });
}
