const path = require('node:path');
const shell = require('shelljs');
const pkg = require('../package.json');

// Resolved before the cd below, because these binaries live in the root
// install while the checks themselves run inside integration/.
const binDir = path.resolve(__dirname, '..', 'node_modules', '.bin');
const publint = path.join(binDir, 'publint');
const attw = path.join(binDir, 'attw');

shell.rm('-rf', 'dist');
const packResult = shell.exec('npm pack --silent', { silent: true });
if (packResult.code !== 0) shell.exit(packResult.code);
const packed =
  packResult.stdout.trim().split('\n').pop() ||
  `${pkg.name}-${pkg.version}.tgz`;

shell.mv(packed, 'integration');
shell.cd('integration');
shell.rm('-rf', 'node_modules');
// --config.minimum-release-age=0 cancels the root-level cooldown that pnpm
// exports as NPM_CONFIG_MINIMUM_RELEASE_AGE when launched via `pnpm run`.
// integration/.npmrc has the same value but is masked by the inherited env;
// the CLI flag wins. This sealed scaffold uses pinned deps, so the cooldown
// adds no protection here. Also sidesteps pnpm 10.16's ERR_PNPM_MISSING_TIME
// on packages whose abbreviated registry metadata lacks the time field.
// --ignore-workspace stops pnpm walking up to the repo root. Without it,
// `pnpm add` of a local tarball registers integration/ as an importer of the
// root workspace and writes the tarball into the root pnpm-lock.yaml.
shell.exec('pnpm install --ignore-workspace --config.minimum-release-age=0');
// `./` prefix is required so pnpm treats the filename as a local tarball
// rather than a registry package name (npm install <name>.tgz is forgiving;
// pnpm add is not).
//
// pnpm add always saves to the manifest and has no --no-save, so snapshot it
// and put it back. The tarball name carries the version and must never be
// committed. Restoring here rather than at the end means a failing check
// below cannot leave the file dirty either; the checks resolve the package
// through node_modules, which is already populated.
const manifest = shell.cat('package.json').toString();
shell.exec(
  `pnpm add --ignore-workspace --config.minimum-release-age=0 ./${packed}`,
);
shell.ShellString(manifest).to('package.json');

shell.set('-e');

// Test
shell.exec('pnpm run typecheck');
shell.exec('pnpm test');
shell.exec('pnpm run build');
shell.exec('node node-smoke/esm-test.mjs');
shell.exec('node node-smoke/cjs-test.cjs');
shell.exec(publint, { cwd: 'node_modules/boardgame.io' });

shell.set('+e');
shell.exec(`${attw} ./${packed} --format table`);
shell.set('-e');

shell.rm(packed);
