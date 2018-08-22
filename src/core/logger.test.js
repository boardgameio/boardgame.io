import * as logging from './logger';

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

  test('error', () => {
    logging.error('msg1');
    expect(console.log).toHaveBeenCalledWith('ERROR: msg1');
  });

  test('info', () => {
    logging.info('msg2');
    expect(console.log).toHaveBeenCalledWith('INFO: msg2');
  });

  test('error stripped in production', () => {
    process.env.NODE_ENV = 'production';
    logging.error('msg1');
    expect(console.log).not.toHaveBeenCalled();
  });

  test('info stripped in production', () => {
    process.env.NODE_ENV = 'production';
    logging.info('msg2');
    expect(console.log).not.toHaveBeenCalled();
  });
});
