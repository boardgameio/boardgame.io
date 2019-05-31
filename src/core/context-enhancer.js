import { Random } from './random';
import { Events } from './events';

/**
 * Context API to allow writing custom logs in games.
 */
export class GameLoggerCtxAPI {
  constructor() {
    this._payload = undefined;
  }

  _api() {
    return {
      setPayload: payload => {
        this._payload = payload;
      },
    };
  }

  attach(ctx) {
    return { ...ctx, log: this._api() };
  }

  update(state) {
    if (this._payload === undefined) {
      return state;
    }

    // attach the payload to the last log event
    let deltalog = state.deltalog;
    deltalog[deltalog.length - 1] = {
      ...deltalog[deltalog.length - 1],
      payload: this._payload,
    };
    this._payload = undefined;

    return { ...state, deltalog };
  }

  static detach(ctx) {
    const { log, ...ctxWithoutLog } = ctx; // eslint-disable-line no-unused-vars
    return ctxWithoutLog;
  }
}

/**
 * This class is used to attach/detach various utility objects
 * onto a ctx, without having to manually attach/detach them
 * all separately.
 */
export class ContextEnhancer {
  constructor(ctx, game, player) {
    this.random = new Random(ctx);
    this.events = new Events(game.flow, player);
    this.log = new GameLoggerCtxAPI();
  }

  attachToContext(ctx) {
    let ctxWithAPI = this.random.attach(ctx);
    ctxWithAPI = this.events.attach(ctxWithAPI);
    ctxWithAPI = this.log.attach(ctxWithAPI);
    return ctxWithAPI;
  }

  static detachAllFromContext(ctx) {
    let ctxWithoutAPI = Random.detach(ctx);
    ctxWithoutAPI = Events.detach(ctxWithoutAPI);
    ctxWithoutAPI = GameLoggerCtxAPI.detach(ctxWithoutAPI);
    return ctxWithoutAPI;
  }

  _update(state, updateEvents) {
    let newState = updateEvents ? this.events.update(state) : state;
    newState = this.random.update(newState);
    newState = this.log.update(newState);
    return newState;
  }

  updateAndDetach(state, updateEvents) {
    const newState = this._update(state, updateEvents);
    newState.ctx = ContextEnhancer.detachAllFromContext(newState.ctx);
    return newState;
  }
}
