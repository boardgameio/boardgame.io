import React from 'react';
import PropTypes from 'prop-types';
import * as Actions from '../../both/action-types';
import './log.css';

/*
 * GameLog
 *
 * Component to log the actions in the game.
 */
export class GameLog extends React.Component {
  static propTypes = {
    log: PropTypes.array.isRequired,
    onRewind: PropTypes.func,
  }

  render() {
    let log = [];
    let turns = [];
    let currentTurn = [];
    let turnToLogIndex = {};

    for (let i = 0; i < this.props.log.length; i++) {
      const item = this.props.log[i];
      if (item.type == Actions.END_TURN) {
        turnToLogIndex[turns.length] = i;
        turns.push(currentTurn);
        currentTurn = [];
      } else {
        const args = item.move.args || [];
        currentTurn.push(
          <div key={i} className="log-move">
          {item.move.type}({args.join(',')})
          </div>
        );
      }
    }

    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      log.push(
        <div key={i}
             className="log-turn"
             onMouseOver={() => this.props.onRewind(turnToLogIndex[i])}
             onMouseOut={() => this.props.onRewind(null)}>
        <div className="id">Turn #{i+1}</div>
        {turn}
        </div>
      );
    }

    return (
      <div className="gamelog">
      {log}
      </div>
    );
  }
}

