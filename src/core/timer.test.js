import { timer } from './timer';

jest.useFakeTimers();
describe('timer', () => {
  let functionToCallWhenTimeIsOut;
  beforeEach(() => {
    functionToCallWhenTimeIsOut = jest.fn();
    timer(2, functionToCallWhenTimeIsOut);
  });

  it('setTimeoutHaveBeenCalled', () => {
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('callback function have been called when time is out', () => {
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).toHaveBeenCalled();
  });
});
