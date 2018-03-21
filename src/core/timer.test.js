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
  let timer = null;
  let functionToCallWhenTimeIsOut = jest.fn();
  beforeEach(() => {
    timer = new Timer();
  });
  it('all methods', () => {
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
    functionToCallWhenTimeIsOut.mockReset();
    timer.pause();
    timer.reset();
    timer.start();
    jest.advanceTimersByTime(1000);
    expect(timer.secondsLeft()).toBe(1);
    const timeLeft = timer.timeLeft();
    expect(timeLeft.h).toBe(0);
    expect(timeLeft.m).toBe(0);
    expect(timeLeft.s).toBe(1);
    expect(functionToCallWhenTimeIsOut).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut).toHaveBeenCalled();
  });
});

describe('two timers', () => {
  const timer1 = new Timer();
  const timer2 = new Timer();
  let functionToCallWhenTimeIsOut1 = jest.fn();
  let functionToCallWhenTimeIsOut2 = jest.fn();
  it("different configuration won' conflict", () => {
    timer1.Duration = 2;
    timer2.Duration = 3;
    timer1.Routine = functionToCallWhenTimeIsOut1;
    timer2.Routine = functionToCallWhenTimeIsOut2;
    timer1.start();
    jest.advanceTimersByTime(1000);
    timer2.start();
    expect(timer1.secondsLeft()).toBe(1);
    expect(timer2.secondsLeft()).toBe(3);
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut1).toHaveBeenCalled();
    timer1.reset();
    timer1.start();
    expect(functionToCallWhenTimeIsOut2).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(timer1.secondsLeft()).toBe(1);
    expect(timer2.secondsLeft()).toBe(1);
    expect(functionToCallWhenTimeIsOut2).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(functionToCallWhenTimeIsOut2).toHaveBeenCalled();
    expect(functionToCallWhenTimeIsOut1).toHaveBeenCalledTimes(2);
  });
});
