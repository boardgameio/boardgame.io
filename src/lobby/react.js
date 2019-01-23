/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Cookies from 'react-cookies';
import PropTypes from 'prop-types';
import { Client } from '../client/react';
import { LobbyConnection } from './connection';
import LobbyLoginForm from './login-form';
import LobbyRoomInstance from './room-instance';
import LobbyCreateRoomForm from './create-room-form';

/**
 * Lobby
 *
 * React lobby component.
 *
 * @param {Array}  gameComponents - An array of Board and Game objects for the supported games.
 * @param {string} lobbyServer - Address of the lobby server (for example 'localhost:8000').
 *                               If not set, defaults to the server that served the page.
 * @param {string} gameServer - Address of the game server (for example 'localhost:8001').
 *                              If not set, defaults to the server that served the page.
 * @param {function} clientFactory - Function that is used to create the game clients.
 * @param {bool}   debug - Enable debug information (default: false).
 *
 * Returns:
 *   A React component that provides a UI to create, list, join, leave, play or spectate game instances.
 */

class Lobby extends React.Component {
  static propTypes = {
    gameComponents: PropTypes.array.isRequired,
    lobbyServer: PropTypes.string,
    gameServer: PropTypes.string,
    debug: PropTypes.bool,
    clientFactory: PropTypes.func,
  };

  static defaultProps = {
    debug: false,
    clientFactory: Client,
  };

  state = {
    phase: 'enter',
    playerName: 'Visitor',
    runningGame: null,
    errorMsg: '',
    credentialStore: {},
  };

  componentDidMount() {
    let cookie = Cookies.load('lobbyState') || {};
    if (cookie.phase && cookie.phase === 'play') {
      cookie.phase = 'list';
    }
    this.setState({
      phase: cookie.phase || 'enter',
      playerName: cookie.playerName || 'Visitor',
      credentialStore: cookie.credentialStore || {},
    });
  }

  componentDidUpdate(prevProps, prevState) {
    let name = this.state.playerName;
    let creds = this.state.credentialStore[name];
    if (
      prevState.phase !== this.state.phase ||
      prevState.credentialStore[name] !== creds ||
      prevState.playerName !== name
    ) {
      this._createConnection(this.props);
      this._updateConnection();
      let cookie = {
        phase: this.state.phase,
        playerName: name,
        credentialStore: this.state.credentialStore,
      };
      Cookies.save('lobbyState', cookie, { path: '/' });
    }
  }

  _createConnection(props) {
    let name = this.state.playerName;
    this.connection = LobbyConnection({
      server: props.lobbyServer,
      gameComponents: props.gameComponents,
      playerName: name,
      playerCredentials: this.state.credentialStore[name],
    });
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

  async _updateConnection() {
    await this.connection.refresh();
    this.forceUpdate();
  }

  constructor(props) {
    super(props);
    this._createConnection(this.props);
    this._updateConnection();
  }

  render() {
    const _getPhaseVisibility = phase => {
      return this.state.phase !== phase ? 'hidden' : 'phase';
    };

    // player info
    let name = this.state.playerName;

    // list of game instances
    let inst_rows = [];
    for (let i = 0; i < this.connection.gameInstances.length; i++) {
      const inst = {
        gameID: this.connection.gameInstances[i].gameID,
        gameName: this.connection.gameInstances[i].gameName,
        players: Object.values(this.connection.gameInstances[i].players),
      };
      inst_rows.push(
        <LobbyRoomInstance
          key={'instance-' + i}
          gameInstance={inst}
          playerName={name}
          onClickJoin={this._joinRoom.bind(this)}
          onClickLeave={this._leaveRoom.bind(this)}
          onClickPlay={this._startGame.bind(this)}
        />
      );
    }

    return (
      <div id="lobby-view" style={{ padding: 50 }}>
        <div className={_getPhaseVisibility('enter')}>
          <LobbyLoginForm
            key={name}
            playerName={name}
            onEnter={this._enterLobby.bind(this)}
          />
        </div>

        <div className={_getPhaseVisibility('list')}>
          <p>Welcome, {name}</p>

          <div className="phase-title" id="game-creation">
            <span>Create a room:</span>
            <LobbyCreateRoomForm
              games={this.props.gameComponents}
              createGame={this._createRoom.bind(this)}
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
        </div>

        <div className={_getPhaseVisibility('play')}>
          {this.state.runningGame ? (
            <this.state.runningGame.app
              gameID={this.state.runningGame.gameID}
              playerID={this.state.runningGame.playerID}
              credentials={this.state.runningGame.credentials}
            />
          ) : (
            ''
          )}
          <div className="buttons" id="game-exit">
            <button onClick={this._exitGame.bind(this)}>Exit game</button>
          </div>
        </div>

        <div className="buttons" id="lobby-exit">
          <button onClick={this._exitLobby.bind(this)}>Exit lobby</button>
        </div>
      </div>
    );
  }

  _enterLobby(playerName) {
    this.setState({
      playerName: playerName,
      phase: 'list',
    });
  }

  async _exitLobby() {
    await this.connection.disconnect();
    this.setState({
      phase: 'enter',
      errorMsg: '',
    });
  }

  async _createRoom(gameName, numPlayers) {
    try {
      await this.connection.create(gameName, numPlayers);
      await this.connection.refresh();
      // rerender
      this.setState({});
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  }

  async _joinRoom(gameName, gameID, playerID) {
    try {
      await this.connection.join(gameName, gameID, playerID);
      await this.connection.refresh();
      this._updateCredentials(
        this.connection.playerName,
        this.connection.playerCredentials
      );
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  }

  async _leaveRoom(gameName, gameID) {
    try {
      await this.connection.leave(gameName, gameID);
      await this.connection.refresh();
      this._updateCredentials(
        this.connection.playerName,
        this.connection.playerCredentials
      );
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  }

  _startGame(gameName, gameOpts) {
    const gameCode = this.connection._getGameComponents(gameName);
    if (!gameCode) {
      this.setState({
        errorMsg: 'game ' + gameName + ' not supported',
      });
      return;
    }

    let multiplayer = null;
    if (gameOpts.numPlayers > 1) {
      if (this.props.gameServer) {
        multiplayer = { server: this.props.gameServer };
      } else {
        multiplayer = true;
      }
    }

    const app = this.props.clientFactory({
      game: gameCode.game,
      board: gameCode.board,
      debug: this.props.debug,
      multiplayer,
    });

    const game = {
      app: app,
      gameID: gameOpts.gameID,
      playerID: gameOpts.numPlayers > 1 ? gameOpts.playerID : null,
      credentials: this.connection.playerCredentials,
    };

    this.setState({
      phase: 'play',
      runningGame: game,
    });
  }

  _exitGame() {
    this.setState({
      phase: 'list',
      runningGame: null,
    });
  }
}

export default Lobby;
