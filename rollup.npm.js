/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import postcss from 'rollup-plugin-postcss'
import filesize from 'rollup-plugin-filesize'
import { minify } from 'uglify-es'
import pkg from './package.json'

const env = process.env.NODE_ENV

const plugins = [
  postcss(),
  babel({ exclude: '**/node_modules/**' }),
  commonjs(),
  resolve({ browser: true }),
  filesize(),
];

export default [
  // Sub-packages.
  {
    input: 'packages/server.js',
    output: { file: 'dist/server.js', format: 'cjs' },
    name: 'Server',
    plugins: [
      babel({ exclude: '**/node_modules/**' }),
      commonjs({
        exclude: 'node_modules/**',
      }),
      resolve(),
    ],
  },

  {
    input: 'packages/client.js',
    external: [ 'react' ],
    globals: { 'react': 'React' },
    output: { file: 'dist/client.js', format: 'umd' },
    name: 'Client',
    plugins: plugins,
  },

  {
    input: 'packages/game.js',
    output: { file: 'dist/game.js', format: 'umd' },
    name: 'Moves',
    plugins: plugins,
  },

  // UMD and ES versions.
  {
    input: 'packages/main.js',
    external: [ 'react' ],
    globals: { 'react': 'React' },
    output: [
      { file: pkg.main, format: 'umd', name: 'BoardgameIO'},
      { file: pkg.module, format: 'es' }
    ],
    plugins: plugins.concat([
      replace({ 'process.env.NODE_ENV': JSON.stringify(env) })
    ]),
  },

  // Browser minified version.
  {
    input: 'packages/main.js',
    external: [ 'react' ],
    globals: { 'react': 'React' },
    output: { file: pkg.unpkg, format: 'umd' },
    name: 'BoardgameIO',
    plugins: plugins.concat([
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      uglify({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      }, minify),
    ]),
  }
];
