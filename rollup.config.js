/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import builtins from 'rollup-plugin-node-builtins';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import ttypescript from 'ttypescript';
import tsPlugin from 'rollup-plugin-typescript2';

const subpackages = [
  'client',
  'core',
  'react',
  'react-native',
  'ai',
  'plugins',
  'master',
  'internal',
];

const plugins = [
  babel({ exclude: '**/node_modules/**' }),
  resolve({ browser: true }),
  svelte({ extensions: ['.svelte'] }),
  filesize(),
];

const serverPlugins = [
  resolve(),
  tsPlugin({ typescript: ttypescript }),
  babel({ exclude: ['**/node_modules/**'] }),
  commonjs({ include: 'node_modules/**' }),
];

const minifiedPlugins = [
  babel({ exclude: '**/node_modules/**' }),
  builtins(),
  resolve({ browser: true, preferBuiltins: false }),
  svelte({ extensions: ['.svelte'] }),
  commonjs(),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  filesize(),
  terser(),
];

const globals = {
  immer: 'immer',
  react: 'React',
  redux: 'Redux',
  'react-cookies': 'Cookies',
  'prop-types': 'PropTypes',
  'socket.io-client': 'io',
  flatted: 'Flatted',
};

export default [
  ...subpackages.map(name => ({
    input: `packages/${name}.js`,
    external: Object.keys(globals),
    output: { file: `dist/${name}.js`, format: 'es' },
    plugins,
  })),

  // Server.
  {
    input: 'packages/server.ts',
    output: { file: 'dist/server.js', format: 'cjs', name: 'Server' },
    plugins: serverPlugins,
  },

  // UMD and ES versions.
  {
    input: 'packages/main.js',
    external: Object.keys(globals),
    output: [
      { file: pkg.main, format: 'umd', name: 'BoardgameIO', globals },
      { file: pkg.module, format: 'es' },
    ],
    plugins,
  },

  // Browser minified version.
  {
    input: 'packages/main.js',
    external: ['react'],
    output: [
      {
        file: pkg.unpkg,
        format: 'umd',
        name: 'BoardgameIO',
        globals,
      },
    ],
    plugins: minifiedPlugins,
  },
];
