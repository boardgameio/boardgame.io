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
    gameInstance: PropTypes.shape({
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
    const inst = this.props.gameInstance;
    let status = 'OPEN';
    if (!inst.players.find(player => !player.name)) {
      status = 'RUNNING';
    }
    return (
      <tr key={'line-' + inst.gameID}>
        <td key={'cell-name-' + inst.gameID}>{inst.gameName}</td>
        <td key={'cell-status-' + inst.gameID}>{status}</td>
        <td key={'cell-seats-' + inst.gameID}>
          {inst.players.map(this._createSeat).join(', ')}
        </td>
        <td key={'cell-buttons-' + inst.gameID}>
          {this._createInstanceButtons(inst)}
        </td>
      </tr>
    );
  }
}

export default LobbyRoomInstance;
