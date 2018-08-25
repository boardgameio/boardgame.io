/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

describe('logging', () => {
  const oldConsoleLog = console.log;
  const oldNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    console.log.mockReset();
  });

  afterAll(() => {
    console.log = oldConsoleLog;
    process.env.NODE_ENV = oldNodeEnv;
  });

  console.log = jest.fn();

  describe('dev', () => {
    let logging;

    beforeAll(() => {
      logging = require('./logger');
    });

    test('error', () => {
      logging.error('msg1');
      expect(console.log).toHaveBeenCalledWith('ERROR: msg1');
    });

    test('info', () => {
      logging.info('msg2');
      expect(console.log).toHaveBeenCalledWith('INFO: msg2');
    });
  });

  describe('production', () => {
    let logging;

    beforeAll(() => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      logging = require('./logger');
    });

    test('error stripped', () => {
      logging.error('msg1');
      expect(console.log).not.toHaveBeenCalled();
    });

    test('info stripped', () => {
      logging.info('msg2');
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
