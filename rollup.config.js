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
import filesize from 'rollup-plugin-filesize';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import ttypescript from 'ttypescript';
import tsPlugin from 'rollup-plugin-typescript2';
const subpackages = require('./subpackages');

const external = [
  ...Object.keys(pkg.dependencies),
  'react',
  'socket.io-client',
];

const plugins = [
  babel({ exclude: '**/node_modules/**' }),
  resolve({ browser: true, only: [/svelte/] }),
  tsPlugin({ typescript: ttypescript }),
  svelte({ extensions: ['.svelte'] }),
];

const serverPlugins = [
  resolve(),
  tsPlugin({ typescript: ttypescript }),
  babel({ exclude: ['**/node_modules/**'] }),
  commonjs({ include: 'node_modules/**' }),
];

const minifiedPlugins = [
  babel({ exclude: '**/node_modules/**' }),
  resolve({ browser: true }),
  tsPlugin({ typescript: ttypescript }),
  svelte({ extensions: ['.svelte'] }),
  commonjs(),
  replace({
    include: 'src/**',
    'process.env.NODE_ENV': JSON.stringify('development'),
  }),
  replace({
    exclude: 'src/**',
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  filesize(),
  terser(),
];

export default [
  // Subpackages.
  {
    input: subpackages.reduce((obj, name) => {
      obj[name] = `packages/${name}.js`;
      return obj;
    }, {}),
    external,
    plugins,
    output: [
      {
        dir: 'dist/esm',
        format: 'esm',
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
      },
    ],
  },

  // Server.
  {
    input: 'packages/server.ts',
    output: { file: 'dist/server.js', format: 'cjs', name: 'Server' },
    plugins: serverPlugins,
  },

  // CJS and ES versions.
  // The subpackages are the preferred way of importing
  // stuff from the library instead of these.
  {
    input: 'packages/main.js',
    external,
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' },
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
        globals: { react: 'React' },
      },
    ],
    plugins: minifiedPlugins,
  },
];
