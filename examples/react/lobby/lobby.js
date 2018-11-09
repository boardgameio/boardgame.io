/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Cookies from 'react-cookies';
import React from 'react';
// FIXME: import { Lobby } from 'boardgame.io/react';
import Lobby from '../../../lobby/react.js';
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
    phase: 'enter', // may be 'enter','list','play'
    playerName: '',
    runningGame: null,
    errorMsg: '',
    refreshLobby: false,
  };

  constructor() {
    super();
    let state = Cookies.load('lobbyState') || {};
    if (state.phase === 'list') {
      this._enterLobby(state.playerName);
    }
    this.setState({
      phase: state.phase || 'enter',
      playerName: state.playerName || 'Visitor',
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.phase !== this.state.phase ||
      prevState.playerName !== this.state.playerName
    ) {
      Cookies.save(
        'lobbyState',
        {
          phase: this.state.phase,
          playerName: this.state.playerName,
        },
        { path: '/' }
      );
    }
  }

  render() {
    const _getPhaseVisibility = phase => {
      return this.state.phase !== phase ? 'hidden' : 'phase';
    };

    return (
      <div style={{ padding: 50 }}>
        <h1>Lobby</h1>

        <div className={_getPhaseVisibility('enter')}>
          <LobbyLoginForm
            playerName={this.state.playerName}
            onEnter={this._enterLobby.bind(this)}
          />
        </div>

        <div className={_getPhaseVisibility('list')}>
          <p>Welcome, {this.state.playerName}</p>
          <Lobby
            server="localhost"
            port={8001}
            gameComponents={importedGames}
            playerName={this.state.playerName}
            onStartGame={this._startGame.bind(this)}
            onExitLobby={this._exitLobby.bind(this)}
            refresh={this.state.refreshLobby}
            multiplayer={{ local: false }}
          />
        </div>

        <div className={_getPhaseVisibility('play')}>
          {this.state.runningGame ? (
            <this.state.runningGame.app
              gameID={this.state.runningGame.gameID}
              playerID={this.state.runningGame.playerID}
              credentials={this.state.runningGame.playerCredentials}
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
