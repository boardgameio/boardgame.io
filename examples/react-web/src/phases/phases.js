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
import './phases.css';

const game = Game({
  setup: () => ({ deck: 5, hand: 0 }),

  phases: {
    take: {
      endPhaseIf: G => G.deck <= 0,
      next: 'play',
      moves: {
        takeCard: G => ({ ...G, deck: G.deck - 1, hand: G.hand + 1 }),
      },
    },
    play: {
      endPhaseIf: G => G.hand <= 0,
      next: 'take',
      moves: {
        playCard: G => ({ ...G, deck: G.deck + 1, hand: G.hand - 1 }),
      },
    },
  },

  flow: {
    startingPhase: 'take',
  },
});

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any,
    events: PropTypes.any,
  };

  takeCard = () => {
    if (this.props.ctx.phase != 'take') return;
    this.props.moves.take.takeCard();
    this.props.events.endTurn();
  };

  playCard = () => {
    if (this.props.ctx.phase != 'play') return;
    this.props.moves.play.playCard();
    this.props.events.endTurn();
  };

  render() {
    return (
      <div className="phases">
        <li style={{ background: '#aaa' }}>{this.props.ctx.phase}</li>
        <li>Deck: {this.props.G.deck}</li>
        <li>Hand: {this.props.G.hand}</li>
        <li>
          <button id="take" onClick={this.takeCard}>
            Take Card
          </button>
        </li>
        <li>
          <button id="play" onClick={this.playCard}>
            Play Card
          </button>
        </li>
      </div>
    );
  }
}

const Phases = Client({
  game,
  numPlayers: 1,
  board: Board,
});

export default Phases;
