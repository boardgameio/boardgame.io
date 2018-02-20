/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';
import filesize from 'rollup-plugin-filesize';
import { minify } from 'uglify-es';
import pkg from './package.json';

const env = process.env.NODE_ENV;

const plugins = [
  postcss(),
  babel({ exclude: '**/node_modules/**' }),
  filesize(),
];

const globals = {
  react: 'React',
  redux: 'Redux',
  'prop-types': 'PropTypes',
  'react-redux': 'ReactRedux',
  'react-json-view': 'ReactJson',
  mousetrap: 'Mousetrap',
  'socket.io-client': 'io',
  'fast-shuffle': 'shuffle',
};

export default [
  // Sub-packages.
  {
    input: 'packages/server.js',
    output: { file: 'dist/server.js', format: 'cjs' },
    name: 'Server',
    plugins: [
      babel({ exclude: ['**/node_modules/**'] }),
      commonjs({
        exclude: 'node_modules/**',
      }),
      resolve(),
    ],
  },

  {
    input: 'packages/client.js',
    external: Object.keys(globals),
    globals,
    output: { file: 'dist/client.js', format: 'umd' },
    name: 'Client',
    plugins: plugins,
  },

  {
    input: 'packages/core.js',
    external: ['fast-shuffle'],
    globals: { 'fast-shuffle': 'shuffle' },
    output: { file: 'dist/core.js', format: 'umd' },
    name: 'Core',
    plugins: plugins,
  },

  {
    input: 'packages/ui.js',
    external: Object.keys(globals),
    globals,
    output: { file: 'dist/ui.js', format: 'umd' },
    name: 'UI',
    plugins: plugins,
  },

  // UMD and ES versions.
  {
    input: 'packages/main.js',
    external: Object.keys(globals),
    globals,
    output: [
      { file: pkg.main, format: 'umd', name: 'BoardgameIO' },
      { file: pkg.module, format: 'es' },
    ],
    plugins: plugins.concat([
      replace({ 'process.env.NODE_ENV': JSON.stringify(env) }),
    ]),
  },

  // Browser minified version.
  {
    input: 'packages/main.js',
    globals: { react: 'React' },
    external: ['react'],
    output: [{ file: pkg.unpkg, format: 'umd' }],
    name: 'BoardgameIO',
    plugins: plugins.concat([
      commonjs(),
      resolve({ browser: true }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      uglify(
        {
          compress: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            warnings: false,
          },
        },
        minify
      ),
    ]),
  },
];
