/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

class LobbyRoomInstance extends React.Component {
  static propTypes = {
    room: PropTypes.shape({
      gameName: PropTypes.string.isRequired,
      gameID: PropTypes.string.isRequired,
      players: PropTypes.array.isRequired,
    }),
    playerName: PropTypes.string.isRequired,
    onClickJoin: PropTypes.func.isRequired,
    onClickLeave: PropTypes.func.isRequired,
    onClickPlay: PropTypes.func.isRequired,
  };

  _createSeat = player => {
    return player.name || '[free]';
  };

  _createInstanceButtons = inst => {
    const playerSeat = inst.players.find(
      player => player.name === this.props.playerName
    );
    const freeSeat = inst.players.find(player => !player.name);
    if (playerSeat && freeSeat) {
      // already seated: waiting for game to start
      return (
        <button
          onClick={() => this.props.onClickLeave(inst.gameName, inst.gameID)}
        >
          Leave
        </button>
      );
    }
    if (freeSeat) {
      // at least 1 seat is available
      return (
        <button
          onClick={() =>
            this.props.onClickJoin(inst.gameName, inst.gameID, '' + freeSeat.id)
          }
        >
          Join
        </button>
      );
    }
    // room is full
    if (playerSeat) {
      return (
        <button
          onClick={() =>
            this.props.onClickPlay(inst.gameName, {
              gameID: inst.gameID,
              playerID: '' + playerSeat.id,
              numPlayers: inst.players.length,
            })
          }
        >
          Play
        </button>
      );
    }
    // allow spectating
    return (
      <button
        onClick={() =>
          this.props.onClickPlay(inst.gameName, {
            gameID: inst.gameID,
            numPlayers: inst.players.length,
          })
        }
      >
        Spectate
      </button>
    );
  };

  render() {
    const room = this.props.room;
    let status = 'OPEN';
    if (!room.players.find(player => !player.name)) {
      status = 'RUNNING';
    }
    return (
      <tr key={'line-' + room.gameID}>
        <td key={'cell-name-' + room.gameID}>{room.gameName}</td>
        <td key={'cell-status-' + room.gameID}>{status}</td>
        <td key={'cell-seats-' + room.gameID}>
          {room.players.map(this._createSeat).join(', ')}
        </td>
        <td key={'cell-buttons-' + room.gameID}>
          {this._createInstanceButtons(room)}
        </td>
      </tr>
    );
  }
}

export default LobbyRoomInstance;
