/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Game } from 'boardgame.io/core';
import { Client } from 'boardgame.io/react';
import './diagram.css';

const game = Game({
  moves: {},
  startingPhase: 'A',
  phases: {
    A: { next: 'B' },
    B: { next: 'C' },
    C: { next: 'A' },
  },
});

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any,
    events: PropTypes.any,
  };

  render() {
    let players = [<th key={-1} />];
    for (let i = 0; i < this.props.ctx.numPlayers; i++) {
      players.push(<th key={i}>{i}</th>);
    }

    let rows = [];
    const phases = ['A', 'B', 'C'];
    for (let p of phases) {
      let row = [<th key="index">{p}</th>];
      for (let i = 0; i < this.props.ctx.numPlayers; i++) {
        let className = '';
        if (
          i + '' == this.props.ctx.currentPlayer &&
          p == this.props.ctx.phase
        ) {
          className = 'active';
        }
        row.push(<td key={i} className={className} />);
      }
      rows.push(<tr key={p}>{row}</tr>);
    }

    return (
      <div className="diagram">
        <table>
          <thead>
            <tr>{players}</tr>
          </thead>

          <tbody>{rows}</tbody>
        </table>

        <div className="buttons">
          <button onClick={() => this.props.events.endTurn()}>endTurn</button>
          <button onClick={() => this.props.events.endPhase()}>endPhase</button>
        </div>
      </div>
    );
  }
}

export const Basic = Client({
  game,
  numPlayers: 3,
  debug: false,
  board: Board,
});
