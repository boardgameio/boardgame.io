import { Timer } from './timer';

jest.useFakeTimers();

describe('timer methods', () => {
  let timer = new Timer();
  let functionToCallWhenTimeIsOut = jest.fn();
  it('Start - Pause - Status', () => {
    timer.Duration = 2;
    timer.Routine = functionToCallWhenTimeIsOut;
    timer.start();
    jest.advanceTimersByTime(1000);
    expect(timer.Status).toBe('Running');
    timer.pause();
    expect(timer.Status).toBe('Paused');
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    timer.start();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).toHaveBeenCalled();
  });
  it('Reset - timeLeft - secondsLeft', () => {
    timer.reset();
    timer.start();
    jest.advanceTimersByTime(1000);
    expect(timer.secondsLeft()).toBe(1);
    const timeleft = timer.timeLeft();
    expect(timeleft.h).toBe(0);
    expect(timeleft.m).toBe(0);
    expect(timeleft.s).toBe(1);
    expect(functionToCallWhenTimeIsOut).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).toHaveBeenCalledTimes(2);
  });
});
describe('timer not initialized', () => {
  let functionToCallWhenTimeIsOut;
  let timer = null;
  beforeEach(() => {
    timer = null;
    timer = new Timer();
    functionToCallWhenTimeIsOut = jest.fn();
  });
  it('setTimeoutHaveBeenCalled', () => {
    timer.Duration = 2;
    timer.Routine = functionToCallWhenTimeIsOut;
    timer.start();
    expect(setInterval).toHaveBeenCalledTimes(4);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('callback function have been called when time is out', () => {
    timer.Duration = 2;
    timer.Routine = functionToCallWhenTimeIsOut;
    timer.start();
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).toHaveBeenCalled();
  });
});
describe('timer initialized', () => {
  let functionToCallWhenTimeIsOut;
  beforeEach(() => {
    functionToCallWhenTimeIsOut = jest.fn();
  });
  it('setTimeoutHaveBeenCalled', () => {
    const timer = new Timer(2, functionToCallWhenTimeIsOut);
    timer.start();
    expect(setInterval).toHaveBeenCalledTimes(6);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('callback function have been called when time is out', () => {
    const timer = new Timer(2, functionToCallWhenTimeIsOut);
    timer.start();
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).toHaveBeenCalled();
  });
});
