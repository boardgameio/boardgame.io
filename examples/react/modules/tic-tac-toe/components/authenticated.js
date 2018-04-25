/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import TicTacToe from '../game';
import Board from './board';
import PropTypes from 'prop-types';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: true,
});

class AuthenticatedClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameID: 'gameID',
      players: {
        '0': {
          credentials: 'credentials',
        },
        '1': {
          credentials: 'credentials',
        },
      },
    };
  }

  onGameIDChange(gameID) {
    this.setState({
      gameID,
      players: {
        ...this.state.players,
      },
    });
  }

  onPlayerCredentialsChange(playerID, credentials) {
    this.setState({
      gameID: this.state.gameID,
      players: {
        ...this.state.players,
        [playerID]: {
          credentials,
        },
      },
    });
  }

  render() {
    return (
      <AuthenticatedExample
        gameID={this.state.gameID}
        players={this.state.players}
        onGameIDChange={this.onGameIDChange.bind(this)}
        onPlayerCredentialsChange={this.onPlayerCredentialsChange.bind(this)}
      />
    );
  }
}

class AuthenticatedExample extends React.Component {
  static propTypes = {
    gameID: PropTypes.string,
    players: PropTypes.any,
    onGameIDChange: PropTypes.any,
    onPlayerCredentialsChange: PropTypes.func,
  };

  render() {
    return (
      <div style={{ padding: 50 }}>
        <h1>Authenticated</h1>
        <div className="runner">
          <input
            type="text"
            defaultValue={this.props.gameID}
            onChange={event => this.props.onGameIDChange(event.target.value)}
          />
          <div className="run">
            <App
              gameID={this.props.gameID}
              playerID="0"
              credentials={this.props.players['0'].credentials}
            />
            <input
              type="text"
              defaultValue={this.props.players['0'].credentials}
              onChange={event =>
                this.props.onPlayerCredentialsChange('0', event.target.value)
              }
            />
          </div>
          <div className="run">
            <App
              gameID={this.props.gameID}
              playerID="1"
              credentials={this.props.players['1'].credentials}
            />
            <input
              type="text"
              defaultValue={this.props.players['1'].credentials}
              onChange={event =>
                this.props.onPlayerCredentialsChange('1', event.target.value)
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

export default AuthenticatedClient;
