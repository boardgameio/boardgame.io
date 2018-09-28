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
import { Lobby as LobbyConnection } from './lobby';
import LobbyRoomInstance from './room_instance';
import LobbyCreateRoomForm from './create_room_form';
import './lobby.css';

class Lobby extends React.Component {
  static propTypes = {
    server: PropTypes.string.isRequired,
    port: PropTypes.number.isRequired,
    gameComponents: PropTypes.object.isRequired,
    playerName: PropTypes.string,
    onStartGame: PropTypes.func.isRequired,
    debug: PropTypes.bool,
    multiplayer: PropTypes.object,
  };

  static propDefaults = {
    playerName: 'Visitor',
    debug: false,
    multiplayer: { local: true },
  };

  state = {
    phase: 'enter', // may be 'enter','list','play'
    games: [],
    instances: [],
    runningGame: null,
    errorMsg: '',
  };

  componentWillMount() {
    this.connection = LobbyConnection({
      server: this.props.server + ':' + this.props.port,
      gameComponents: this.props.gameComponents,
      playerName: this.props.playerName,
    });
    this.connection.refresh();
    this.setState({
      instances: this.connection.gameInstances,
    });
  }

  _getGameComponents(gameName) {
    for (let comp of Object.values(this.props.gameComponents)) {
      if (comp.game.name == gameName) return comp;
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
      const inst = {
        gameID: this.state.instances[i].gameID,
        gameName: this.state.instances[i].gameName,
        players: Object.values(this.state.instances[i].players),
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
        <h1>Lobby</h1>

        <div id="phase-join">
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
      </div>
    );
  }

  _createRoom(gameName, numPlayers) {
    // request new game instance
    if (this.connection.create(gameName, numPlayers)) {
      this.connection.refresh();
      this.setState({ instances: this.connection.gameInstances });
    } else {
      this.setState({ errorMsg: this.connection.errorMsg });
    }
  }

  _joinRoom(gameName, gameID, playerID) {
    if (this.connection.join(gameName, gameID, playerID)) {
      this.connection.refresh();
      this.setState({ instances: this.connection.gameInstances });
    } else {
      this.setState({ errorMsg: this.connection.errorMsg });
    }
  }

  _leaveRoom(gameName, gameID) {
    if (this.connection.leave(gameName, gameID)) {
      this.connection.refresh();
      this.setState({ instances: this.connection.gameInstances });
    } else {
      this.setState({ errorMsg: this.connection.errorMsg });
    }
  }

  _play(gameName, gameOpts) {
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
      debug: this.props.debug,
      multiplayer: this.props.multiplayer,
    });
    this.props.onStartGame(app, gameOpts);
  }
}

export default Lobby;
