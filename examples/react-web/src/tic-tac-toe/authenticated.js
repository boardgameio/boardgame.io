/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import TicTacToe from './game';
import Board from './board';
import PropTypes from 'prop-types';
import request from 'superagent';

const hostname = window.location.hostname;
const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: SocketIO({ server: `${hostname}:8000` }),
});

class AuthenticatedClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      matchID: 'matchID',
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

  async componentDidMount() {
    const gameName = 'tic-tac-toe';
    const PORT = 8000;

    const newGame = await request
      .post(`http://${hostname}:${PORT}/games/${gameName}/create`)
      .send({ numPlayers: 2 });

    const matchID = newGame.body.matchID;

    let playerCredentials = [];

    for (let playerID of [0, 1]) {
      const player = await request
        .post(`http://${hostname}:${PORT}/games/${gameName}/${matchID}/join`)
        .send({
          gameName,
          playerID,
          playerName: playerID.toString(),
        });

      playerCredentials.push(player.body.playerCredentials);
    }

    this.setState({
      matchID,
      players: {
        '0': {
          credentials: playerCredentials[0],
        },
        '1': {
          credentials: playerCredentials[1],
        },
      },
    });
  }

  onPlayerCredentialsChange(playerID, credentials) {
    this.setState({
      matchID: this.state.matchID,
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
        matchID={this.state.matchID}
        players={this.state.players}
        onPlayerCredentialsChange={this.onPlayerCredentialsChange.bind(this)}
      />
    );
  }
}

class AuthenticatedExample extends React.Component {
  static propTypes = {
    matchID: PropTypes.string,
    players: PropTypes.any,
    onPlayerCredentialsChange: PropTypes.func,
  };

  render() {
    return (
      <div>
        <h1>Authenticated</h1>

        <p>
          Change the credentials of a player, and you will notice that the
          server no longer accepts moves from that client.
        </p>

        <div className="runner">
          <div className="run">
            <App
              matchID={this.props.matchID}
              playerID="0"
              credentials={this.props.players['0'].credentials}
            />
            <input
              type="text"
              value={this.props.players['0'].credentials}
              onChange={event =>
                this.props.onPlayerCredentialsChange('0', event.target.value)
              }
            />
          </div>
          <div className="run">
            <App
              matchID={this.props.matchID}
              playerID="1"
              credentials={this.props.players['1'].credentials}
            />
            <input
              type="text"
              value={this.props.players['1'].credentials}
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
