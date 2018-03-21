/**
 * This class create a timer and store the time status in it
 * The status can be running or paused
 *
 * Thanks to Alexey "akaguny" for the initial idea
 */
export class Timer {
  /**
   * constructor
   * @param {number} duration The duration of the timer in seconds
   * @param {function} callback The routine to do at the end of the timer
   */
  constructor(duration = 0, callback = null) {
    this._running = false;
    this._duration = duration;
    this._elapsedTime = 0;
    this._callback = callback;
    this._timer = null;
  }

  /**
   * Start the timer
   */
  start() {
    this._running = true;
    this._timer = setInterval(() => {
      if (this._duration <= ++this._elapsedTime) {
        clearInterval(this._timer);
        this._timer = null;
        this._running = false;
        if (this._callback) this._callback();
      }
    }, 1000);
  }

  /**
   *  Pause the timer
   */
  pause() {
    clearInterval(this._timer);
    this._timer = null;
    this._running = false;
  }

  /**
   * Reset the timer
   */
  reset() {
    this._elapsedTime = 0;
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    if (this._running) this.start();
  }

  /**
   * Return how many seconds are left
   * @returns {number} Seconds Left
   */
  secondsLeft() {
    return this._duration - this._elapsedTime;
  }

  /**
   * Return an object, this object contains ow many time left
   * @returns {object} Time left {
   *  h: number,
   *  m: number,
   *  s: number
   * }
   */
  timeLeft() {
    let seconds = this.secondsLeft();
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    return {
      h: hours,
      m: minutes % 60,
      s: seconds % 60,
    };
  }

  /**
   *  Return if the timer is running or not
   */
  get Status() {
    return this._running ? 'Running' : 'Paused';
  }

  /**
   *
   */
  set Duration(seconds) {
    this._duration = seconds;
  }

  /**
   *
   */
  set Routine(callback) {
    this._callback = callback;
  }
}
