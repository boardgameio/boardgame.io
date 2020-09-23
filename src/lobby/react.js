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
import { MCTSBot } from '../ai/mcts-bot';
import { Local } from '../client/transport/local';
import { SocketIO } from '../client/transport/socketio';
import { LobbyConnection } from './connection';
import LobbyLoginForm from './login-form';
import LobbyMatchInstance from './match-instance';
import LobbyCreateMatchForm from './create-match-form';

const LobbyPhases = {
  ENTER: 'enter',
  PLAY: 'play',
  LIST: 'list',
};

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
 * @param {number} refreshInterval - Interval between server updates (default: 2000ms).
 * @param {bool}   debug - Enable debug information (default: false).
 *
 * Returns:
 *   A React component that provides a UI to create, list, join, leave, play or
 *   spectate matches (game instances).
 */
class Lobby extends React.Component {
  static propTypes = {
    gameComponents: PropTypes.array.isRequired,
    lobbyServer: PropTypes.string,
    gameServer: PropTypes.string,
    debug: PropTypes.bool,
    clientFactory: PropTypes.func,
    refreshInterval: PropTypes.number,
  };

  static defaultProps = {
    debug: false,
    clientFactory: Client,
    refreshInterval: 2000,
  };

  state = {
    phase: LobbyPhases.ENTER,
    playerName: 'Visitor',
    runningMatch: null,
    errorMsg: '',
    credentialStore: {},
  };

  constructor(props) {
    super(props);
    this._createConnection(this.props);
    setInterval(this._updateConnection, this.props.refreshInterval);
  }

  componentDidMount() {
    let cookie = Cookies.load('lobbyState') || {};
    if (cookie.phase && cookie.phase === LobbyPhases.PLAY) {
      cookie.phase = LobbyPhases.LIST;
    }
    this.setState({
      phase: cookie.phase || LobbyPhases.ENTER,
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

  _createConnection = props => {
    const name = this.state.playerName;
    this.connection = LobbyConnection({
      server: props.lobbyServer,
      gameComponents: props.gameComponents,
      playerName: name,
      playerCredentials: this.state.credentialStore[name],
    });
  };

  _updateCredentials = (playerName, credentials) => {
    this.setState(prevState => {
      // clone store or componentDidUpdate will not be triggered
      const store = Object.assign({}, prevState.credentialStore);
      store[[playerName]] = credentials;
      return { credentialStore: store };
    });
  };

  _updateConnection = async () => {
    await this.connection.refresh();
    this.forceUpdate();
  };

  _enterLobby = playerName => {
    this.setState({ playerName, phase: LobbyPhases.LIST });
  };

  _exitLobby = async () => {
    await this.connection.disconnect();
    this.setState({ phase: LobbyPhases.ENTER, errorMsg: '' });
  };

  _createMatch = async (gameName, numPlayers) => {
    try {
      await this.connection.create(gameName, numPlayers);
      await this.connection.refresh();
      // rerender
      this.setState({});
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _joinMatch = async (gameName, matchID, playerID) => {
    try {
      await this.connection.join(gameName, matchID, playerID);
      await this.connection.refresh();
      this._updateCredentials(
        this.connection.playerName,
        this.connection.playerCredentials
      );
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _leaveMatch = async (gameName, matchID) => {
    try {
      await this.connection.leave(gameName, matchID);
      await this.connection.refresh();
      this._updateCredentials(
        this.connection.playerName,
        this.connection.playerCredentials
      );
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _startMatch = (gameName, matchOpts) => {
    const gameCode = this.connection._getGameComponents(gameName);
    if (!gameCode) {
      this.setState({
        errorMsg: 'game ' + gameName + ' not supported',
      });
      return;
    }

    let multiplayer = undefined;
    if (matchOpts.numPlayers > 1) {
      if (this.props.gameServer) {
        multiplayer = SocketIO({ server: this.props.gameServer });
      } else {
        multiplayer = SocketIO();
      }
    }

    if (matchOpts.numPlayers == 1) {
      const maxPlayers = gameCode.game.maxPlayers;
      let bots = {};
      for (let i = 1; i < maxPlayers; i++) {
        bots[i + ''] = MCTSBot;
      }
      multiplayer = Local({ bots });
    }

    const app = this.props.clientFactory({
      game: gameCode.game,
      board: gameCode.board,
      debug: this.props.debug,
      multiplayer,
    });

    const match = {
      app: app,
      matchID: matchOpts.matchID,
      playerID: matchOpts.numPlayers > 1 ? matchOpts.playerID : '0',
      credentials: this.connection.playerCredentials,
    };

    this.setState({ phase: LobbyPhases.PLAY, runningMatch: match });
  };

  _exitMatch = () => {
    this.setState({ phase: LobbyPhases.LIST, runningMatch: null });
  };

  _getPhaseVisibility = phase => {
    return this.state.phase !== phase ? 'hidden' : 'phase';
  };

  renderMatches = (matches, playerName) => {
    return matches.map(match => {
      const { matchID, gameName, players } = match;
      return (
        <LobbyMatchInstance
          key={'instance-' + matchID}
          match={{ matchID, gameName, players: Object.values(players) }}
          playerName={playerName}
          onClickJoin={this._joinMatch}
          onClickLeave={this._leaveMatch}
          onClickPlay={this._startMatch}
        />
      );
    });
  };

  render() {
    const { gameComponents, renderer } = this.props;
    const { errorMsg, playerName, phase, runningMatch } = this.state;

    if (renderer) {
      return renderer({
        errorMsg,
        gameComponents,
        matches: this.connection.matches,
        phase,
        playerName,
        runningMatch,
        handleEnterLobby: this._enterLobby,
        handleExitLobby: this._exitLobby,
        handleCreateMatch: this._createMatch,
        handleJoinMatch: this._joinMatch,
        handleLeaveMatch: this._leaveMatch,
        handleExitMatch: this._exitMatch,
        handleRefreshMatches: this._updateConnection,
        handleStartMatch: this._startMatch,
      });
    }

    return (
      <div id="lobby-view" style={{ padding: 50 }}>
        <div className={this._getPhaseVisibility(LobbyPhases.ENTER)}>
          <LobbyLoginForm
            key={playerName}
            playerName={playerName}
            onEnter={this._enterLobby}
          />
        </div>

        <div className={this._getPhaseVisibility(LobbyPhases.LIST)}>
          <p>Welcome, {playerName}</p>

          <div className="phase-title" id="match-creation">
            <span>Create a match:</span>
            <LobbyCreateMatchForm
              games={gameComponents}
              createMatch={this._createMatch}
            />
          </div>
          <p className="phase-title">Join a match:</p>
          <div id="instances">
            <table>
              <tbody>
                {this.renderMatches(this.connection.matches, playerName)}
              </tbody>
            </table>
            <span className="error-msg">
              {errorMsg}
              <br />
            </span>
          </div>
          <p className="phase-title">
            Matches that become empty are automatically deleted.
          </p>
        </div>

        <div className={this._getPhaseVisibility(LobbyPhases.PLAY)}>
          {runningMatch && (
            <runningMatch.app
              matchID={runningMatch.matchID}
              playerID={runningMatch.playerID}
              credentials={runningMatch.credentials}
            />
          )}
          <div className="buttons" id="match-exit">
            <button onClick={this._exitMatch}>Exit match</button>
          </div>
        </div>

        <div className="buttons" id="lobby-exit">
          <button onClick={this._exitLobby}>Exit lobby</button>
        </div>
      </div>
    );
  }
}

export default Lobby;
