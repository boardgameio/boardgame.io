/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Client } from 'boardgame.io/react';
import { LobbyConnection } from './lobby';
import LobbyRoomInstance from './room-instance';
import LobbyCreateRoomForm from './create-room-form';

/**
 * Lobby
 *
 * React lobby component.
 *
 * @param {string}   server - Host address of the server.
 * @param {number}   port - HTTP port of the server.
 * @param {Array}    gameComponents - An array of Board and Game objects for the supported games.
 * @param {string}   playerName - The name of the player.
 * @param {function} onStartGame - Hook for game creation, called with arguments:
 *                                   app: instance of Client.
 *                                   gameOpts: props for the React component of the game.
 * @param {function} onExitLobby - Hook called when the player exits the lobby. No arguments.
 * @param {bool}     debug - Enable debug information.
 * @param {bool}     refresh - Change the value of this property to refresh the list of game instances.
 *
 * Returns:
 *   A React component that provides a UI to create, list, join, leave, play or spectate game instances.
 */

class Lobby extends React.Component {
  static propTypes = {
    server: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    gameComponents: PropTypes.array.isRequired,
    playerName: PropTypes.string,
    onStartGame: PropTypes.func.isRequired,
    onExitLobby: PropTypes.func,
    debug: PropTypes.bool,
    refresh: PropTypes.bool,
    multiplayer: PropTypes.object,
  };

  static propDefaults = {
    playerName: 'Visitor',
    debug: false,
    multiplayer: { local: true },
    refresh: false,
    onExitLobby: () => {},
  };

  state = {
    errorMsg: '',
  };

  async _updateConnection(props) {
    this.connection = LobbyConnection({
      server: props.server + ':' + props.port,
      gameComponents: props.gameComponents,
      playerName: props.playerName,
    });
    await this.connection.refresh();
    this.forceUpdate();
  }

  componentWillMount() {
    this._updateConnection(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.playerName !== this.props.playerName ||
      nextProps.refresh !== this.props.refresh
    ) {
      this._updateConnection(nextProps);
    }
  }

  render() {
    // list of game instances
    let inst_rows = [];
    for (let i = 0; i < this.connection.gameInstances.length; i++) {
      const gameURL = `http://${this.props.server}:${this.props.port - 1}/${
        this.connection.gameInstances[i].gameName
      }/${this.connection.gameInstances[i].gameID}`;
      const inst = {
        gameID: this.connection.gameInstances[i].gameID,
        gameName: this.connection.gameInstances[i].gameName,
        players: Object.values(this.connection.gameInstances[i].players),
      };
      inst_rows.push(
        <LobbyRoomInstance
          key={'instance-' + i}
          gameInstance={inst}
          gameURL={gameURL}
          playerName={this.props.playerName}
          onClickJoin={this._joinRoom.bind(this)}
          onClickLeave={this._leaveRoom.bind(this)}
          onClickPlay={this._play.bind(this)}
        />
      );
    }

    return (
      <div id="lobby-view" style={{ padding: 50 }}>
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
        <div className="buttons">
          <button onClick={this._exitLobby.bind(this)}>Exit lobby</button>
        </div>
      </div>
    );
  }

  async _createRoom(gameName, numPlayers) {
    if (await this.connection.create(gameName, numPlayers)) {
      await this.connection.refresh();
    }
    this.setState({ errorMsg: this.connection.errorMsg });
  }

  async _joinRoom(gameName, gameID, playerID) {
    if (await this.connection.join(gameName, gameID, playerID)) {
      await this.connection.refresh();
    }
    this.setState({ errorMsg: this.connection.errorMsg });
  }

  async _leaveRoom(gameName, gameID) {
    if (await this.connection.leave(gameName, gameID)) {
      await this.connection.refresh();
    }
    this.setState({ errorMsg: this.connection.errorMsg });
  }

  async _exitLobby() {
    await this.connection.disconnect();
    this.props.onExitLobby();
  }

  _play(gameName, gameOpts) {
    const gameCode = this.connection._getGameComponents(gameName);
    if (!gameCode) {
      this.setState({
        errorMsg: 'game ' + gameName + ' not supported',
      });
      return;
    }
    const app = Client({
      game: gameCode.game,
      board: gameCode.board,
      debug: this.props.debug,
      multiplayer: gameOpts.numPlayers > 1 ? this.props.multiplayer : null,
    });
    this.props.onStartGame(app, gameOpts);
  }
}

export default Lobby;
