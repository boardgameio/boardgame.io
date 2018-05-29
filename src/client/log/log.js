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
import './log.css';

/*
 * GameLog
 *
 * Component to log the actions in the game.
 */
export class GameLog extends React.Component {
  static propTypes = {
    onHover: PropTypes.func,
    reducer: PropTypes.func,
    initialState: PropTypes.any.isRequired,
    log: PropTypes.array.isRequired,
  };

  onRewind = logIndex => {
    if (logIndex == null) {
      this.props.onHover({ logIndex, state: null });
      return;
    }

    let state = this.props.initialState;

    for (let i = 0; i <= logIndex; i++) {
      const action = this.props.log[i];
      state = this.props.reducer(state, action);
    }

    state = { G: state.G, ctx: state.ctx };

    this.props.onHover({ logIndex, state });
  };

  render() {
    let log = [];
    let turns = [];
    let currentTurn = [];
    let turnToLogIndex = {};
    const playerIDs = new Map();

    for (let i = 0; i < this.props.log.length; i++) {
      const item = this.props.log[i];
      if (item.type == Actions.GAME_EVENT && item.payload.type == 'endTurn') {
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
          onMouseEnter={() => this.onRewind(turnToLogIndex[i])}
          onMouseLeave={() => this.onRewind(null)}
        >
          <div className="id">Turn #{i + 1}</div>
          {turn}
        </div>
      );
    }

    return <div className="gamelog">{log}</div>;
  }
}
