import { Timer } from './timer';

jest.useFakeTimers();
describe('timer initialized', () => {
  const functionToCallWhenTimeIsOut = jest.fn();
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

describe('timer not initialized', () => {
  let timer = new Timer();
  let functionToCallWhenTimeIsOut = jest.fn();
  it('Start - Pause - Status - Routine', () => {
    // setInterval.mockReset();
    timer.Duration = 2;
    timer.Routine = () => {
      functionToCallWhenTimeIsOut();
    };
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
    functionToCallWhenTimeIsOut.mockReset();
    timer.pause();
    timer.reset();
    timer.start();
    jest.advanceTimersByTime(1000);
    expect(timer.secondsLeft()).toBe(1);
    const timeleft = timer.timeLeft();
    expect(timeleft.h).toBe(0);
    expect(timeleft.m).toBe(0);
    expect(timeleft.s).toBe(1);
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).toHaveBeenCalled();
  });
});
