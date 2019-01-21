var shell = require('shelljs');

shell.rm('-rf', 'dist');
shell.rm('-f', [
  'server.js',
  'client.js',
  'core.js',
  'plugins.js',
  'ui.js',
  'ai.js',
  'ai-visualize.js',
  'master.js',
  'react.js',
  'react-native.js',
]);
