/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Cookies from 'react-cookies';
import React from 'react';
import { Lobby } from 'boardgame.io/react';
import { default as BoardTicTacToe } from '../tic-tac-toe/board';
import { default as BoardChess } from '../chess/board';
import { default as GameTicTacToe } from '../tic-tac-toe/game';
import { default as GameChess } from '../chess/game';
import { LobbyLoginForm } from './login-form';
import './lobby.css';

GameTicTacToe.minPlayers = 1;
GameTicTacToe.maxPlayers = 2;
GameChess.minPlayers = GameChess.maxPlayers = 2;

const importedGames = [
  { game: GameTicTacToe, board: BoardTicTacToe },
  { game: GameChess, board: BoardChess },
];

class LobbyExample extends React.Component {
  state = {
    phase: 'enter',
    playerName: 'Visitor',
    credentialStore: {},
  };

  componentDidMount() {
    let cookie = Cookies.load('lobbyState') || {};
    if (cookie.phase === 'play') {
      cookie.phase = 'list';
    }
    this.setState({
      phase: cookie.phase || 'enter',
      playerName: cookie.playerName || 'Visitor',
      credentialStore: cookie.credentialStore || {},
      runningGame: null,
      errorMsg: '',
      refreshLobby: false,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    let name = this.state.playerName;
    let creds = this.state.credentialStore[name];
    if (
      prevState.phase !== this.state.phase ||
      prevState.playerName !== name ||
      prevState.credentialStore[name] !== creds
    ) {
      let cookie = {
        phase: this.state.phase,
        playerName: name,
        credentialStore: this.state.credentialStore,
      };
      Cookies.save('lobbyState', cookie, { path: '/' });
    }
  }

  render() {
    const _getPhaseVisibility = phase => {
      return this.state.phase !== phase ? 'hidden' : 'phase';
    };
    let name = this.state.playerName;
    let creds = this.state.credentialStore[name];

    return (
      <div style={{ padding: 50 }}>
        <h1>Lobby</h1>

        <div className={_getPhaseVisibility('enter')}>
          <LobbyLoginForm
            key={name}
            playerName={name}
            onEnter={this._enterLobby.bind(this)}
          />
        </div>

        <div className={_getPhaseVisibility('list')}>
          <p>Welcome, {name}</p>
          <Lobby
            server="localhost"
            port={8001}
            gameComponents={importedGames}
            playerName={name}
            playerCredentials={creds}
            onUpdateCredentials={this._updateCredentials.bind(this)}
            onStartGame={this._startGame.bind(this)}
            onExitLobby={this._exitLobby.bind(this)}
            refresh={this.state.refreshLobby}
            multiplayer={true}
          />
        </div>

        <div className={_getPhaseVisibility('play')}>
          {this.state.runningGame ? (
            <this.state.runningGame.app
              gameID={this.state.runningGame.gameID}
              playerID={this.state.runningGame.playerID}
              credentials={creds}
            />
          ) : (
            ''
          )}
          <div className="buttons">
            <button onClick={() => this.onClickExitGame()}>Exit game</button>
          </div>
        </div>
      </div>
    );
  }

  _enterLobby(playerName) {
    if (playerName) {
      this.setState({
        playerName: playerName,
        phase: 'list',
        refreshLobby: !this.state.refreshLobby,
      });
    }
  }

  _updateCredentials(playerName, credentials) {
    this.setState(prevState => {
      // clone store or componentDidUpdate will not be triggered
      let store = Object.assign({}, prevState.credentialStore);
      store[[playerName]] = credentials;
      return {
        credentialStore: store,
      };
    });
  }

  _startGame(clientInstance, gameOpts) {
    let game = this.state.runningGame || {
      app: clientInstance,
      gameID: gameOpts.gameID,
      playerID: gameOpts.numPlayers > 1 ? gameOpts.playerID : null,
      credentials: gameOpts.playerCredentials,
    };
    this.setState({
      phase: 'play',
      runningGame: game,
    });
  }

  _exitLobby() {
    this.setState({
      phase: 'enter',
      errorMsg: '',
    });
  }

  onClickExitGame() {
    this.setState({
      phase: 'list',
      runningGame: null,
    });
  }
}

const LobbyView = () => (
  <div style={{ padding: 50 }}>
    <LobbyExample />
  </div>
);

export default LobbyView;
