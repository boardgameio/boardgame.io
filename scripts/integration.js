const shell = require('shelljs');

shell.rm('-rf', 'dist');
shell.exec('npm pack');
const packed = shell.ls('./boardgame.io-*.tgz').stdout.trim();

shell.mv(packed, 'integration');
shell.cd('integration');
shell.rm('-rf', 'node_modules');
shell.exec('npm install');
shell.exec(`npm install ${packed}`);
shell.rm(packed);

shell.set('-e');

// Test
shell.exec('npm test');
shell.exec('npm run build');
