describe('logging', () => {
  // spy on console.log
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
    const logging = require('./logger');

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
    // first, set NODE_ENV
    const prevNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    afterAll(() => {
      process.env.NODE_ENV = prevNodeEnv;
    });

    // then, re-import logger
    jest.resetModules();
    const logging = require('./logger');

    test('error stripped', () => {
      process.env.NODE_ENV = 'production';
      logging.error('msg1');
      expect(console.log).not.toHaveBeenCalled();
    });

    test('info stripped', () => {
      process.env.NODE_ENV = 'production';
      logging.info('msg2');
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
