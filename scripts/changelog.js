// Generates docs/CHANGELOG.md
// Run this right after the npm version command.

const { EOL } = require('os');
const shell = require('shelljs');
const tempy = require('tempy');

shell.config.silent = true;
const P = EOL + EOL;

const CURRENT_TAG = shell
  .exec('git tag --sort=v:refname')
  .tail({ '-n': 1 })
  .stdout.trim();

const PREVIOUS_TAG = shell
  .exec('git tag --sort=v:refname')
  .tail({ '-n': 2 })
  .head({ '-n': 1 })
  .stdout.trim();

/** This is a “major” release if the version is 0.x.0 or x.0.0 */
const IS_MAJOR = /^v?(0\.\d+\.0|\d+.0.0)$/.test(CURRENT_TAG);

const FILE = tempy.file();

/** Tests for a `feat` commit type. */
const isFeature = (s) => /feat(\(\w+\))?:/.test(s);
/** Tests for commit types that don’t need adding to the CHANGELOG (like `docs` or `chore`). */
const isUninformative = (s) =>
  /(test|style|chore|docs|ci)(\([\w-]+\))?:/.test(s);
/** Tests if this commit just bumped the version (via `npm version`). */
const isVersionBump = (s) => /^\w+\s\d+\.\d+\.\d+$/.test(s);

const changes = shell
  .exec(`git log --oneline "${PREVIOUS_TAG}"..`)
  .split(EOL)
  .filter((line) => !isUninformative(line) && !isVersionBump(line));

/**
 * Format an array of commit details and concatenate into a string.
 * @param {string[]} changes
 */
const formatChanges = (changes) =>
  changes
    .map((line) =>
      line
        // Strip standalone commit types ('feat:', 'fix:', etc.)
        .replace(/[a-z]+: /, '')
        // Format scoped commit types ('feat(foo):' => 'foo:', etc.)
        .replace(/[a-z]+\((\w+)\)/, '$1')
        // Linkify commit refs.
        .replace(
          /^(\w+)\s/,
          '* [[$1](https://github.com/boardgameio/boardgame.io/commit/$1)]'
        )
        // Linkify PR references.
        .replace(
          /\(#(\d{3,})\)/,
          '([#$1](https://github.com/boardgameio/boardgame.io/pull/$1))'
        )
        .replace(/\)](\w*)/, ')] $1')
    )
    .join(EOL);

const features = formatChanges(changes.filter((line) => isFeature(line)));
const others = formatChanges(changes.filter((line) => !isFeature(line)));

let NOTES = (IS_MAJOR ? '## ' : '### ') + CURRENT_TAG + P;
if (features.length > 0) NOTES += '#### Features' + P + features + P;
if (others.length > 0) NOTES += '#### Bugfixes' + P + others + P;
shell.ShellString(NOTES).toEnd(FILE);
shell.echo(NOTES);

shell.cat('docs/documentation/CHANGELOG.md').toEnd(FILE);
shell.cp(FILE, 'docs/documentation/CHANGELOG.md');
