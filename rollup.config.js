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
import typescript from 'rollup-plugin-typescript2';
const subpackages = require('./subpackages');

const internalDeps = ['svelte'];
const external = [
  ...Object.keys(pkg.dependencies).filter(name => !internalDeps.includes(name)),
  'react',
  'socket.io-client',
];

const plugins = [
  babel({ exclude: '**/node_modules/**' }),
  resolve({ browser: true, only: [/svelte/] }),
  typescript({
    typescript: require('typescript'),
    tsconfigOverride: {
      compilerOptions: {
        declaration: true,
        declarationDir: './dist/types',
      },
    },
    useTsconfigDeclarationDir: true,
  }),
  svelte({ extensions: ['.svelte'] }),
];

const serverPlugins = [
  resolve(),
  typescript({ typescript: require('typescript') }),
  babel({ exclude: ['**/node_modules/**'] }),
  commonjs({ include: 'node_modules/**' }),
];

const minifiedPlugins = [
  babel({ exclude: '**/node_modules/**' }),
  resolve({ browser: true }),
  typescript({ typescript: require('typescript') }),
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
      obj[name] = `packages/${name}.ts`;
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
    output: { dir: 'dist/cjs', format: 'cjs' },
    external,
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
    input: 'packages/client.ts',
    output: [
      {
        file: pkg.unpkg,
        format: 'umd',
        name: 'BoardgameIO',
      },
    ],
    plugins: minifiedPlugins,
  },
];
