'use strict';

const js = require('@eslint/js');
const globals = require('globals');
const jest = require('eslint-plugin-jest');
const unicorn = require('eslint-plugin-unicorn');
const react = require('eslint-plugin-react');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  // Formerly .eslintignore.
  {
    ignores: [
      'examples/',
      'dist/',
      'node_modules/',
      'coverage/',
      'npm/',
      'docs/',
      'integration/',
      // The .eslintrc setup ignored dotfiles by default; flat config does not,
      // so keep this jsdom stub module out of linting as before.
      '.empty_module.js',
    ],
  },

  // Flat config only lints .js/.mjs/.cjs by default; the .eslintrc setup also
  // linted .ts and .tsx, so register those extensions too.
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
  },

  // Formerly the `extends` list, in the same order.
  js.configs.recommended,
  jest.configs['flat/recommended'],
  unicorn.configs['flat/recommended'],
  react.configs.flat.recommended,
  ...typescriptEslint.configs['flat/recommended'],
  prettierRecommended,

  {
    // Preserve the .eslintrc/CLI default: flat config now defaults
    // `reportUnusedDisableDirectives` to "warn", so pin it back to keep the
    // set of reported problems unchanged by this migration.
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },

    // Formerly `env: { node, browser, es6 }`.
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // eslint
      'no-console': 'off',
      'prefer-const': ['error', { destructuring: 'all' }],

      // plugin:unicorn
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-fn-reference-in-iterator': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-reduce': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-code-point': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-structured-clone': 'off',
      'unicorn/prefer-event-target': 'off',
      'unicorn/throw-new-error': 'off',

      // plugin:@typescript-eslint
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { args: 'after-used', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
    },
  },
];
