/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './log.css';

/**
 * LogEvent
 *
 * Logs a single action in the game.
 */
const LogEvent = props => {
  const action = props.action;
  const args = action.payload.args || [];
  const playerID = action.payload.playerID;
  let classNames = `log-event player${playerID}`;

  if (props.pinned) {
    classNames += ' pinned';
  }

  return (
    <div
      className={classNames}
      onClick={() => props.onLogClick(props.logIndex)}
      onMouseEnter={() => props.onMouseEnter(props.logIndex)}
      onMouseLeave={() => props.onMouseLeave()}
    >
      {action.payload.type}({args.join(',')})
    </div>
  );
};

LogEvent.propTypes = {
  action: PropTypes.any.isRequired,
  logIndex: PropTypes.number.isRequired,
  onLogClick: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  pinned: PropTypes.bool,
};

const TurnMarker = props => (
  <div className="turn-marker">Turn #{props.turn}</div>
);

TurnMarker.propTypes = {
  turn: PropTypes.number.isRequired,
};

/**
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

  static defaultProps = {
    onHover: () => {},
  };

  state = {
    pinned: null,
  };

  rewind = logIndex => {
    let state = this.props.initialState;
    for (let i = 0; i <= logIndex; i++) {
      const action = this.props.log[i];
      state = this.props.reducer(state, action);
    }
    return { G: state.G, ctx: state.ctx };
  };

  onLogClick = logIndex => {
    this.setState(o => {
      const state = this.rewind(logIndex);
      const metadata = this.props.log[logIndex].payload.metadata;

      if (o.pinned === logIndex) {
        this.props.onHover({ logIndex, state, metadata: undefined });
        return { pinned: null };
      }

      this.props.onHover({ logIndex, state, metadata });
      return { pinned: logIndex };
    });
  };

  onMouseEnter = logIndex => {
    if (this.state.pinned === null) {
      const state = this.rewind(logIndex);
      this.props.onHover({ logIndex, state });
    }
  };

  onMouseLeave = () => {
    if (this.state.pinned === null) {
      this.props.onHover({ state: null });
    }
  };

  render() {
    let log = [];
    let turn = 1;
    let turnDelimiter = true;

    for (let i = 0; i < this.props.log.length; i++) {
      if (turnDelimiter) {
        turnDelimiter = false;
        log.push(<TurnMarker key={'turn' + turn} turn={turn} />);
      }

      const action = this.props.log[i];
      log.push(
        <LogEvent
          key={i}
          pinned={i === this.state.pinned}
          logIndex={i}
          onLogClick={this.onLogClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          action={action}
        />
      );

      if (action.payload.type == 'endTurn') {
        turn++;
        turnDelimiter = true;
      }
    }

    let className = 'gamelog';
    if (this.state.pinned !== null) {
      className += ' pinned';
    }
    return <div className={className}>{log}</div>;
  }
}
