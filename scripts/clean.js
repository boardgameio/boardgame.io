var shell = require('shelljs');

shell.rm('-rf', 'dist');
shell.rm('-f', [
  'server.js',
  'client.js',
  'core.js',
  'plugins.js',
  'ai.js',
  'master.js',
  'react.js',
  'react-native.js',
]);
