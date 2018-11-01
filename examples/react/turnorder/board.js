import React from 'react';
import PropTypes from 'prop-types';
import './simulator.css';

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any,
    events: PropTypes.any,
    playerID: PropTypes.any,
  };

  render() {
    if (this.props.playerID === null) {
      if (this.props.ctx.phase === 'default') {
        return null;
      }

      return (
        <div className="table-interior">
          <label>phase</label>
          <div className="phase">{this.props.ctx.phase}</div>
        </div>
      );
    }

    let className = 'player';
    let active = false;
    let current = false;
    let onClick = () => {};

    if (this.props.ctx.actionPlayers.includes(this.props.playerID)) {
      className += ' active';
      active = true;
    }

    if (this.props.playerID == this.props.ctx.currentPlayer) {
      className += ' current';
      current = true;
    }

    const moves = Object.entries(this.props.moves)
      .filter(e => this.props.ctx.allowedMoves.includes(e[0]))
      .map(e => (
        <button key={e[0]} onClick={e[1]}>
          {e[0]}
        </button>
      ));

    const events = Object.entries(this.props.events)
      .filter(() => current && active)
      .filter(e => e[0] != 'setActionPlayers')
      .map(e => (
        <button key={e[0]} onClick={e[1]}>
          {e[0]}
        </button>
      ));

    return (
      <div className="player-wrap">
        <span className={className} onClick={onClick}>
          {this.props.playerID}
        </span>

        <div className="controls">
          {active && moves}
          {events}
        </div>
      </div>
    );
  }
}

export default Board;
