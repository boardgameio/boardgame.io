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
import './simulator.css';

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any,
    events: PropTypes.any,
  };

  render() {
    let players = [];
    for (let i = 0; i < this.props.ctx.numPlayers; i++) {
      let className = 'player';

      if (i + '' == this.props.ctx.currentPlayer) {
        className += ' current';
      }

      if (this.props.ctx.actionPlayers.includes(i + '')) {
        className += ' active';
      }

      players.push(
        <div key={i} className={className}>
          {i}
        </div>
      );
    }

    return (
      <div className="turnorder-simulator">
        <div className="player-container">
          {players}

          <div className="end-turn" onClick={this.props.events.endTurn}>
            End Turn
          </div>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.init();
  }

  init() {
    const game = Game({
      moves: {},
    });

    this.client = Client({
      game,
      numPlayers: 6,
      debug: false,
      board: Board,
    });

    this.forceUpdate();
  }

  render() {
    const C = this.client;
    return <C />;
  }
}

export default App;
