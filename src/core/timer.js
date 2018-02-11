export function timer(timeLeft = 0, callback) {
  let _timeLeft = timeLeft,
    _timer = setInterval(() => {
      if (_timeLeft === 0 || --_timeLeft === 0) {
        clearInterval(_timer);
        callback && callback();
      }
    }, 1000);
}
