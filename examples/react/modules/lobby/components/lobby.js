/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import 'whatwg-fetch';
import cookie from 'react-cookies';
import React from 'react';
import PropTypes from 'prop-types';
import { Client } from 'boardgame.io/react';
import { default as BoardTicTacToe } from './board-tic-tac-toe';
import { default as BoardChess } from './board-chess';
import { default as BoardTurnOrder } from './board-turnorder';
import { default as GameTicTacToe } from './game-tic-tac-toe';
import { default as GameChess } from './game-chess';
import { default as GameTurnOrder } from './game-turnorder';
import LobbyRoomInstance from './room_instance';
import LobbyLoginForm from './login_form';
import LobbyCreateRoomForm from './create_room_form';
import './lobby.css';

class Lobby extends React.Component {
  static propTypes = {
    server: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    gameComponents: PropTypes.arrayOf(
      PropTypes.shape({
        game: PropTypes.object,
        board: PropTypes.func,
      })
    ).isRequired,
  };

  state = {
    phase: 'enter', // may be 'enter','list','play'
    playerName: '',
    games: [],
    instances: [],
    runningGame: null,
    errorMsg: '',
  };

  componentWillMount() {
    let state = cookie.load('lobbyState') || {};
    if (state.phase === 'list') {
      this._enterLobby(state.playerName);
    }
    this.setState({
      phase: state.phase || 'enter',
      playerName: state.playerName || '',
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.phase !== this.state.phase ||
      prevState.playerName !== this.state.playerName
    ) {
      cookie.save(
        'lobbyState',
        {
          phase: this.state.phase,
          playerName: this.state.playerName,
        },
        { path: '/' }
      );
    }
  }

  _getGameComponents(gameName) {
    let gameIndex = this.props.gameComponents.length;
    while (gameIndex > 0) {
      if (this.props.gameComponents[gameIndex - 1].game.name == gameName)
        return this.props.gameComponents[gameIndex - 1];
      gameIndex--;
    }
    return null;
  }

  render() {
    // list of game instances
    let inst_rows = [];
    for (let i = 0; i < this.state.instances.length; i++) {
      const gameURL = `http://${this.props.server}:${this.props.port - 1}/${
        this.state.instances[i].gameName
      }/${this.state.instances[i].gameID}`;
      inst_rows.push(
        <LobbyRoomInstance
          key={'instance-' + i}
          gameInstance={this.state.instances[i]}
          gameURL={gameURL}
          playerName={this.state.playerName}
          onClickJoin={this._joinRoom.bind(this)}
          onClickLeave={this._leaveRoom.bind(this)}
          onClickPlay={this._play.bind(this)}
        />
      );
    }

    const _getPhaseVisibility = phase => {
      return this.state.phase !== phase ? 'hidden' : 'phase';
    };

    return (
      <div id="lobby-view" style={{ padding: 50 }}>
        <h1>Lobby</h1>

        <div id="phase-enter" className={_getPhaseVisibility('enter')}>
          <LobbyLoginForm
            playerName={this.state.playerName}
            onEnter={this._enterLobby.bind(this)}
          />
        </div>

        <div id="phase-join" className={_getPhaseVisibility('list')}>
          <div className="phase-title" id="game-creation">
            <span>Create a room:</span>
            <LobbyCreateRoomForm
              games={this.state.games}
              createGame={this._createGame.bind(this)}
            />
          </div>
          <p className="phase-title">Join a room:</p>
          <div id="instances">
            <table>
              <tbody>{inst_rows}</tbody>
            </table>
            <span className="error-msg">
              {this.state.errorMsg}
              <br />
            </span>
          </div>
          <p className="phase-title">
            Rooms that become empty are automatically deleted.
          </p>
          <div className="buttons">
            <button onClick={() => this.onClickExitLobby()}>Exit lobby</button>
          </div>
        </div>

        <div id="phase-play" className={_getPhaseVisibility('play')}>
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

  _baseUrl() {
    return `http://${this.props.server}:${this.props.port}/games`;
  }

  _fetchGameInstances(gameName) {
    // request list of game instances
    fetch(this._baseUrl() + '/' + gameName)
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        // record name of game
        for (let inst of json.gameInstances) {
          inst.gameName = gameName;
        }
        // append instances to the list
        const instances = this.state.instances.concat(json.gameInstances);
        this.setState({
          errorMsg: '',
          instances: instances,
        });
      })
      .catch(ex => {
        console.log('error', ex);
        this.setState({
          errorMsg:
            'failed to retrieve instances of game ' + gameName + '(' + ex + ')',
        });
      });
  }

  _enterLobby(playerName) {
    if (playerName) {
      this.setState({ playerName: playerName });
    }
    // fetch list of games
    fetch(this._baseUrl())
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        for (let game of json) {
          this._fetchGameInstances(game);
        }
        this.setState({
          games: json,
          instances: [],
          phase: 'list',
        });
      })
      .catch(ex => {
        console.log('error', ex);
        this.setState({
          errorMsg: 'failed to retrieve list of games (' + ex + ')',
        });
      });
  }

  _createGame(gameName, numPlayers) {
    // request new game instance
    fetch(this._baseUrl() + '/' + gameName + '/create', {
      method: 'POST',
      body: JSON.stringify({ numPlayers: numPlayers }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(resp => {
        return resp.json();
      })
      .then(() => {
        // update list of instances
        this._enterLobby();
      })
      .catch(ex => {
        console.log('error', ex);
        this.setState({ errorMsg: 'failed to create room (' + ex + ')' });
      });
  }

  _joinRoom(gameName, gameID, playerID) {
    if (
      this.state.runningGame &&
      this.state.runningGame.playerName === this.state.playerName
    ) {
      this.setState({
        errorMsg: 'cannot join more than 1 room',
      });
      return;
    }
    // join game instance
    fetch(this._baseUrl() + '/' + gameName + '/' + gameID + '/join', {
      method: 'POST',
      body: JSON.stringify({
        playerID: playerID,
        playerName: this.state.playerName,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(resp => {
        return resp.json();
      })
      .then(() => {
        // refresh game instances
        this._enterLobby();
        this.setState({ errorMsg: '' });
      })
      .catch(ex => {
        console.log('error', ex);
        this.setState({
          errorMsg: 'failed to join room (' + ex + ')',
        });
      });
  }

  _leaveRoom(gameName, gameID, playerID, playerCredentials) {
    // leave instance
    fetch(this._baseUrl() + '/' + gameName + '/' + gameID + '/leave', {
      method: 'POST',
      body: JSON.stringify({
        playerID: playerID,
        playerCredentials: playerCredentials,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(resp => {
        return resp.json();
      })
      .then(() => {
        // refresh game instances
        this._enterLobby();
        this.setState({
          errorMsg: '',
        });
      })
      .catch(ex => {
        console.log('error', ex);
        this.setState({ errorMsg: 'failed to leave room (' + ex + ')' });
      });
  }

  _play(gameName, gameID, playerID, playerCredentials) {
    const gameCode = this._getGameComponents(gameName);
    if (!gameCode) {
      this.setState({
        errorMsg: 'game ' + gameName + ' not supported',
      });
      return;
    }
    const app = Client({
      game: gameCode.game,
      board: gameCode.board,
      debug: false,
      multiplayer: true,
    });
    let game = this.state.runningGame || {
      app: app,
      gameID: gameID,
      playerID: '' + playerID,
      credentials: playerCredentials,
    };
    this.setState({
      phase: 'play',
      runningGame: game,
    });
  }

  onClickExitLobby() {
    this.setState({ phase: 'enter' });
  }

  onClickExitGame() {
    this._enterLobby();
    this.setState({
      phase: 'list',
      runningGame: null,
    });
  }
}

const gameMap = [
  { game: GameTicTacToe, board: BoardTicTacToe },
  { game: GameChess, board: BoardChess },
  { game: GameTurnOrder, board: BoardTurnOrder },
];

const LobbyView = () => (
  <div style={{ padding: 50 }}>
    <Lobby server="localhost" port={8001} gameComponents={gameMap} />
  </div>
);

export default LobbyView;
