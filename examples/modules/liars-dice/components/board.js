/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';

class Board extends React.Component {
  static propTypes = {
    G: PropTypes.any.isRequired,
    ctx: PropTypes.any.isRequired,
    moves: PropTypes.any.isRequired,
    endTurn: PropTypes.any,
    playerID: PropTypes.string,
    isActive: PropTypes.bool,
  };

  constructor() {
    super();
    this.state = { bidNumber: 1, bidValue: 1 };
  }

  handleChangeNumber = e => {
    this.setState({ bidNumber: e.target.value });
  };

  handleChangeValue = e => {
    this.setState({ bidValue: e.target.value });
  };

  render() {
    return (
      <div className="liars-dice">
        <section>
          {Object.keys(this.props.G.players).map(playerID => (
            <div key={playerID}>
              Dice: {JSON.stringify(this.props.G.players[playerID])}
            </div>
          ))}
        </section>

        <section>
          <div>
            how many
            <input
              type="number"
              value={this.state.bidNumber}
              onChange={this.handleChangeNumber}
              min="1"
              max="15"
              className="Number"
            />
          </div>

          <div>
            dice value
            <input
              type="number"
              value={this.state.bidValue}
              onChange={this.handleChangeValue}
              min="1"
              max="6"
              className="Value"
            />
          </div>

          <button>Bid</button>
          <button>Challenge</button>
        </section>

        <section>
          <pre>{JSON.stringify(this.props.G, null, 2)}</pre>
        </section>
      </div>
    );
  }
}

export default Board;
