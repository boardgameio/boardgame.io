/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

class LobbyCreateRoomForm extends React.Component {
  static propTypes = {
    games: PropTypes.arrayOf(PropTypes.string).isRequired,
    createGame: PropTypes.func.isRequired,
  };

  state = {
    selectedGame: 0,
    numPlayers: 2,
  };

  _createGameNameOption(gameName, idx) {
    return (
      <option key={'option-' + idx} value={idx}>
        {gameName}
      </option>
    );
  }

  render() {
    return (
      <div>
        <select
          value={this.state.selectedGame}
          onChange={evt => this.onChangeSelectedGame(evt)}
        >
          {this.props.games.map(this._createGameNameOption)}
        </select>
        <span>Players:</span>
        <select
          value={this.state.numPlayers}
          onChange={evt => this.onChangeNumPlayers(evt)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <span className="buttons">
          <button onClick={() => this.onClickCreate()}>Create</button>
        </span>
      </div>
    );
  }

  onChangeNumPlayers(event) {
    this.setState({
      numPlayers: event.target.value,
    });
  }

  onChangeSelectedGame(event) {
    this.setState({
      selectedGame: Number.parseInt(event.target.value),
    });
  }

  onClickCreate() {
    this.props.createGame(
      this.props.games[this.state.selectedGame],
      this.state.numPlayers
    );
  }
}

export default LobbyCreateRoomForm;
