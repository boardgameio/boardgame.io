// Generates docs/CHANGELOG.md
// Run this right after the npm version command.

const { EOL } = require('os');
const shell = require('shelljs');
const tempy = require('tempy');

const CURRENT_TAG = shell
  .exec('git tag --sort=v:refname', { silent: true })
  .tail({ '-n': '1' })
  .stdout.trim();

const PREVIOUS_TAG = shell
  .exec('git tag --sort=v:refname', { silent: true })
  .tail({ '-n': 2 })
  .head({ '-n': 1 })
  .stdout.trim();

const FILE = tempy.file();

shell.echo(`## ${CURRENT_TAG}${EOL}`).toEnd(FILE);
shell.echo(EOL).toEnd(FILE);
shell.echo(`#### Features${EOL}`).toEnd(FILE);
shell.echo(EOL).toEnd(FILE);
shell.echo(`#### Bugfixes${EOL}`).toEnd(FILE);
shell.echo(EOL).toEnd(FILE);

shell
  .exec(`git log --oneline "${PREVIOUS_TAG}"..`, { silent: true })
  .sed(
    /(\w+)/,
    '* [[$1](https://github.com/boardgameio/boardgame.io/commit/$1)]'
  )
  .toEnd(FILE);

shell.echo(EOL).toEnd(FILE);

shell.cat('docs/documentation/CHANGELOG.md').toEnd(FILE);
shell.cp(FILE, 'docs/documentation/CHANGELOG.md');
