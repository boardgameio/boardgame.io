const shell = require('shelljs');
const pkg = require('../package.json');

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
shell.exec('pnpm install --config.minimum-release-age=0');
// `./` prefix is required so pnpm treats the filename as a local tarball
// rather than a registry package name (npm install <name>.tgz is forgiving;
// pnpm add is not).
shell.exec(`pnpm add --config.minimum-release-age=0 ./${packed}`);

shell.set('-e');

// Test
shell.exec('pnpm run typecheck');
shell.exec('pnpm test');
shell.exec('pnpm run build');
shell.exec('node node-smoke/esm-test.mjs');
shell.exec('node node-smoke/cjs-test.cjs');
shell.exec('pnpm dlx publint@latest', { cwd: 'node_modules/boardgame.io' });

shell.set('+e');
shell.exec(`pnpm dlx @arethetypeswrong/cli@0.18.2 ./${packed} --format table`);
shell.set('-e');

shell.rm(packed);
