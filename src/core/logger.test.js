import * as logging from './logger';

describe('logging', () => {
  // spy on console.log
  const oldConsoleLog = console.log;
  console.log = jest.fn();
  afterAll(() => {
    console.log = oldConsoleLog;
  });

  beforeEach(() => {
    console.log.mockReset();
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
