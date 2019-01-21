module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        exclude: ['transform-regenerator', 'transform-async-to-generator'],
      },
    ],
    '@babel/preset-react',
  ],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs'],
    },
  },
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          'boardgame.io': './packages',
        },
      },
    ],
    '@babel/plugin-proposal-class-properties',
  ],
};
