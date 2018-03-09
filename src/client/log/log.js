/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import * as Actions from '../../core/action-types';
import { restore } from '../../core/action-creators';
import './log.css';

/*
 * GameLog
 *
 * Component to log the actions in the game.
 */
export class GameLog extends React.Component {
  static propTypes = {
    store: PropTypes.any.isRequired,
  };

  onRewind = logIndex => {
    if (logIndex == null) {
      this.props.store.dispatch(restore(this._toRestore));
      return;
    }

    const state = this.props.store.getState();
    this._toRestore = state;
    const initial = state._initial;
    this.props.store.dispatch(restore(initial));

    for (let i = 0; i <= logIndex; i++) {
      const action = state.log[i];

      if (
        action.type == Actions.GAME_EVENT ||
        action.type == Actions.MAKE_MOVE
      ) {
        action.remote = true; // don't broadcast action.
        this.props.store.dispatch(action);
      }
    }
  };

  render() {
    let log = [];
    let turns = [];
    let currentTurn = [];
    let turnToLogIndex = {};
    const playerIDs = new Map();
    const state = this.props.store.getState();

    for (let i = 0; i < state.log.length; i++) {
      const item = state.log[i];
      if (
        (item.type == Actions.GAME_EVENT && item.payload.type == 'endTurn') ||
        ['endTurn', 'endPhase'].includes(item.type)
      ) {
        turnToLogIndex[turns.length] = i;
        turns.push(currentTurn);
        currentTurn = [];
      } else {
        const args = item.payload.args || [];

        const playerID = item.payload.playerID;
        if (!playerIDs.has(playerID)) {
          playerIDs.set(playerID, playerIDs.size);
        }
        const playerNumber = playerIDs.get(playerID);
        const classNames = `log-move player${playerNumber}`;

        currentTurn.push(
          <div key={i} className={classNames}>
            {item.payload.type}({args.join(',')})
          </div>
        );
      }
    }

    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      log.push(
        <div
          key={i}
          className="log-turn"
          onMouseOver={() => this.onRewind(turnToLogIndex[i])}
          onMouseOut={() => this.onRewind(null)}
        >
          <div className="id">Turn #{i + 1}</div>
          {turn}
        </div>
      );
    }

    return <div className="gamelog">{log}</div>;
  }
}
