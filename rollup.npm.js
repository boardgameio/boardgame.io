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
import postcss from 'rollup-plugin-postcss';
import filesize from 'rollup-plugin-filesize';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import ttypescript from 'ttypescript';
import tsPlugin from 'rollup-plugin-typescript2';

const env = process.env.NODE_ENV;

const plugins = [
  postcss(),
  babel({ exclude: '**/node_modules/**' }),
  filesize(),
];

const clientPlugins = [
  postcss(),
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
  // Sub-packages.
  {
    input: 'packages/server.ts',
    output: { file: 'dist/server.js', format: 'cjs', name: 'Server' },
    plugins: serverPlugins,
  },

  {
    input: 'packages/react.js',
    external: Object.keys(globals),
    output: { file: 'dist/react.js', format: 'umd', name: 'Client', globals },
    plugins: clientPlugins,
  },

  {
    input: 'packages/client.js',
    external: Object.keys(globals),
    output: { file: 'dist/client.js', format: 'umd', name: 'Client', globals },
    plugins: clientPlugins,
  },

  {
    input: 'packages/react-native.js',
    external: Object.keys(globals),
    output: {
      file: 'dist/react-native.js',
      format: 'umd',
      name: 'ReactNativeClient',
      globals,
    },
    plugins: clientPlugins,
  },

  {
    input: 'packages/master.js',
    external: Object.keys(globals),
    output: { file: 'dist/master.js', format: 'umd', name: 'Master', globals },
    plugins,
  },

  {
    input: 'packages/core.js',
    external: Object.keys(globals),
    output: { file: 'dist/core.js', format: 'umd', name: 'Core', globals },
    plugins,
  },

  {
    input: 'packages/plugins.js',
    external: Object.keys(globals),
    output: {
      file: 'dist/plugins.js',
      format: 'umd',
      name: 'Plugins',
      globals,
    },
    plugins,
  },

  {
    input: 'packages/ai.js',
    external: Object.keys(globals),
    output: { file: 'dist/ai.js', format: 'umd', name: 'AI', globals },
    plugins,
  },

  {
    input: 'packages/internal.js',
    external: Object.keys(globals),
    output: {
      file: 'dist/internal.js',
      format: 'umd',
      name: 'Internal',
      globals,
    },
    plugins,
  },

  // UMD and ES versions.
  {
    input: 'packages/main.js',
    external: Object.keys(globals),
    output: [
      { file: pkg.main, format: 'umd', name: 'BoardgameIO', globals },
      { file: pkg.module, format: 'es', globals },
    ],
    plugins: plugins.concat([
      svelte({ extensions: ['.svelte'] }),
      resolve({ browser: true }),
      replace({ 'process.env.NODE_ENV': JSON.stringify(env) }),
    ]),
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
    plugins: plugins.concat([
      builtins(),
      resolve({ browser: true, preferBuiltins: false }),
      svelte({ extensions: ['.svelte'] }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser(),
    ]),
  },
];
