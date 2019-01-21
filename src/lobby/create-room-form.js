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
    games: PropTypes.array.isRequired,
    createGame: PropTypes.func.isRequired,
  };

  state = {
    selectedGame: 0,
    numPlayers: 2,
  };

  _createGameNameOption(game, idx) {
    return (
      <option key={'name-option-' + idx} value={idx}>
        {game.game.name}
      </option>
    );
  }

  _createNumPlayersOption(idx) {
    return (
      <option key={'num-option-' + idx} value={idx}>
        {idx}
      </option>
    );
  }

  _createNumPlayersRange(game) {
    if (!game.minPlayers) {
      game.minPlayers = 1;
    }
    if (!game.maxPlayers) {
      game.maxPlayers = 4;
    }
    console.assert(game.maxPlayers >= game.minPlayers);
    return [...new Array(game.maxPlayers + 1).keys()].slice(game.minPlayers);
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
          {this._createNumPlayersRange(
            this.props.games[this.state.selectedGame].game
          ).map(this._createNumPlayersOption)}
        </select>
        <span className="buttons">
          <button onClick={() => this.onClickCreate()}>Create</button>
        </span>
      </div>
    );
  }

  onChangeNumPlayers(event) {
    this.setState({
      numPlayers: Number.parseInt(event.target.value),
    });
  }

  onChangeSelectedGame(event) {
    let idx = Number.parseInt(event.target.value);
    this.setState({
      selectedGame: idx,
      numPlayers: this._createNumPlayersRange(this.props.games[idx].game)[0],
    });
  }

  onClickCreate() {
    this.props.createGame(
      this.props.games[this.state.selectedGame].game.name,
      this.state.numPlayers
    );
  }
}

export default LobbyCreateRoomForm;
