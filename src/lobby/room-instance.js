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

  _createButtonJoin = (inst, seatId) => (
    <button
      key={'button-join-' + inst.gameID}
      onClick={() =>
        this.props.onClickJoin(inst.gameName, inst.gameID, '' + seatId)
      }
    >
      Join
    </button>
  );

  _createButtonLeave = inst => (
    <button
      key={'button-leave-' + inst.gameID}
      onClick={() => this.props.onClickLeave(inst.gameName, inst.gameID)}
    >
      Leave
    </button>
  );

  _createButtonPlay = (inst, seatId) => (
    <button
      key={'button-play-' + inst.gameID}
      onClick={() =>
        this.props.onClickPlay(inst.gameName, {
          gameID: inst.gameID,
          playerID: '' + seatId,
          numPlayers: inst.players.length,
        })
      }
    >
      Play
    </button>
  );

  _createButtonSpectate = inst => (
    <button
      key={'button-spectate-' + inst.gameID}
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

  _createInstanceButtons = inst => {
    const playerSeat = inst.players.find(
      player => player.name === this.props.playerName
    );
    const freeSeat = inst.players.find(player => !player.name);
    if (playerSeat && freeSeat) {
      // already seated: waiting for game to start
      return this._createButtonLeave(inst);
    }
    if (freeSeat) {
      // at least 1 seat is available
      return this._createButtonJoin(inst, freeSeat.id);
    }
    // room is full
    if (playerSeat) {
      return (
        <div>
          {[
            this._createButtonPlay(inst, playerSeat.id),
            this._createButtonLeave(inst),
          ]}
        </div>
      );
    }
    // allow spectating
    return this._createButtonSpectate(inst);
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
