const { compile } = require('svelte/compiler');
const { transformSync } = require('@babel/core');

module.exports = {
  process(source, filename) {
    const { js } = compile(source, {
      filename,
      generate: 'client',
      dev: false,
      css: 'injected',
    });
    const transformed = transformSync(js.code, {
      filename,
      babelrc: false,
      configFile: false,
      sourceMaps: 'inline',
      inputSourceMap: js.map,
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    });
    return { code: transformed.code, map: transformed.map };
  },
};
