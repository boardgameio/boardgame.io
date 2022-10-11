import { PlayerView } from '../plugins/main';
import { createPatch } from 'rfc6902';
import type { Game, State, LogEntry, PlayerID } from '../types';
import type { TransportData, IntermediateTransportData } from './master';

const applyPlayerView = (
  game: Game,
  playerID: string | null,
  state: State
): State => ({
  ...state,
  G: game.playerView({ G: state.G, ctx: state.ctx, playerID }),
  plugins: PlayerView(state, { playerID, game }),
  deltalog: undefined,
  _undo: [],
  _redo: [],
});

/** Gets a function that filters the TransportData for a given player and game. */
export const getFilterPlayerView =
  (game: Game) =>
  (
    playerID: string | null,
    payload: IntermediateTransportData
  ): TransportData => {
    switch (payload.type) {
      case 'patch': {
        const [matchID, stateID, prevState, state] = payload.args;
        const log = redactLog(state.deltalog, playerID);
        const filteredState = applyPlayerView(game, playerID, state);
        const newStateID = state._stateID;
        const prevFilteredState = applyPlayerView(game, playerID, prevState);
        const patch = createPatch(prevFilteredState, filteredState);
        return {
          type: 'patch',
          args: [matchID, stateID, newStateID, patch, log],
        };
      }
      case 'update': {
        const [matchID, state] = payload.args;
        const log = redactLog(state.deltalog, playerID);
        const filteredState = applyPlayerView(game, playerID, state);
        return {
          type: 'update',
          args: [matchID, filteredState, log],
        };
      }
      case 'sync': {
        const [matchID, syncInfo] = payload.args;
        const filteredState = applyPlayerView(game, playerID, syncInfo.state);
        const log = redactLog(syncInfo.log, playerID);
        const newSyncInfo = {
          ...syncInfo,
          state: filteredState,
          log,
        };
        return {
          type: 'sync',
          args: [matchID, newSyncInfo],
        };
      }
      default: {
        return payload;
      }
    }
  };

/**
 * Redact the log.
 *
 * @param {Array} log - The game log (or deltalog).
 * @param {String} playerID - The playerID that this log is
 *                            to be sent to.
 */
export function redactLog(log: LogEntry[], playerID: PlayerID | null) {
  if (log === undefined) {
    return log;
  }

  return log.map((logEvent) => {
    // filter for all other players and spectators.
    if (playerID !== null && +playerID === +logEvent.action.payload.playerID) {
      return logEvent;
    }

    if (logEvent.redact !== true) {
      return logEvent;
    }

    const payload = {
      ...logEvent.action.payload,
      args: null,
    };
    const filteredEvent = {
      ...logEvent,
      action: { ...logEvent.action, payload },
    };

    const { redact, ...remaining } = filteredEvent;
    return remaining;
  });
}
