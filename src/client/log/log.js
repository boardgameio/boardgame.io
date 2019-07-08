/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { MAKE_MOVE } from '../../core/action-types';
import './log.css';

/**
 * Default component to render custom payload.
 */
const CustomPayload = props => {
  const custompayload =
    props.payload !== undefined ? JSON.stringify(props.payload, null, 4) : '';
  return <div>{custompayload}</div>;
};
CustomPayload.propTypes = {
  payload: PropTypes.any,
};

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

  // allow to pass in custom rendering component for custom payload
  const customPayload =
    props.payloadComponent !== undefined ? (
      React.createElement(props.payloadComponent, { payload: props.payload })
    ) : (
      <CustomPayload payload={props.payload} />
    );

  return (
    <div
      className={classNames}
      onClick={() => props.onLogClick(props.logIndex)}
      onMouseEnter={() => props.onMouseEnter(props.logIndex)}
      onMouseLeave={() => props.onMouseLeave()}
    >
      <div>
        {action.payload.type}({args.join(',')})
      </div>
      {customPayload}
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
  payload: PropTypes.object,
  payloadComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
};

/**
 * TurnMarker
 *
 * The markers on the left of the log events that indicate
 * which turn the event belongs to.
 */
const TurnMarker = props => {
  return (
    <div className="turn-marker" style={{ gridRow: 'span ' + props.numEvents }}>
      {props.turn}
    </div>
  );
};

TurnMarker.propTypes = {
  turn: PropTypes.number.isRequired,
  numEvents: PropTypes.number.isRequired,
};

/**
 * PhaseMarker
 *
 * The markers on the right of the log events that indicate
 * which phase the event belongs to.
 */
const PhaseMarker = props => {
  return (
    <div
      className="phase-marker"
      style={{ gridRow: 'span ' + props.numEvents }}
    >
      {props.phase}
    </div>
  );
};

PhaseMarker.propTypes = {
  phase: PropTypes.string.isRequired,
  numEvents: PropTypes.number.isRequired,
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
    payloadComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  };

  static defaultProps = {
    onHover: () => {},
  };

  state = {
    pinned: null,
  };

  rewind = logIndex => {
    let state = this.props.initialState;
    for (let i = 0; i < this.props.log.length; i++) {
      const { action, automatic } = this.props.log[i];

      if (!automatic) {
        state = this.props.reducer(state, action);
      }

      if (action.type == MAKE_MOVE) {
        if (logIndex == 0) {
          break;
        }

        logIndex--;
      }
    }
    return { G: state.G, ctx: state.ctx };
  };

  onLogClick = logIndex => {
    this.setState(o => {
      const state = this.rewind(logIndex);
      const renderedLogEntries = this.props.log.filter(
        e => e.action.type == MAKE_MOVE
      );
      const metadata = renderedLogEntries[logIndex].action.payload.metadata;

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
    let turns = [];
    let phases = [];
    let eventsInCurrentPhase = 0;
    let eventsInCurrentTurn = 0;

    const renderedLogEntries = this.props.log.filter(
      e => e.action.type == MAKE_MOVE
    );

    for (let i = 0; i < renderedLogEntries.length; i++) {
      const { action, payload, turn, phase } = renderedLogEntries[i];

      eventsInCurrentPhase++;
      eventsInCurrentTurn++;

      log.push(
        <LogEvent
          key={i}
          pinned={i === this.state.pinned}
          logIndex={i}
          onLogClick={this.onLogClick}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          action={action}
          payload={payload}
          payloadComponent={this.props.payloadComponent}
        />
      );

      if (
        i == renderedLogEntries.length - 1 ||
        renderedLogEntries[i + 1].turn != turn
      ) {
        turns.push(
          <TurnMarker
            key={turns.length}
            turn={turn}
            numEvents={eventsInCurrentTurn}
          />
        );
        eventsInCurrentTurn = 0;
      }

      if (
        i == renderedLogEntries.length - 1 ||
        renderedLogEntries[i + 1].phase != phase
      ) {
        phases.push(
          <PhaseMarker
            key={phases.length}
            phase={phase}
            numEvents={eventsInCurrentPhase}
          />
        );
        eventsInCurrentPhase = 0;
      }
    }

    let className = 'gamelog';
    if (this.state.pinned !== null) {
      className += ' pinned';
    }

    return (
      <div className={className}>
        {turns}
        {log}
        {phases}
      </div>
    );
  }
}
