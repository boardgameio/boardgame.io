/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

class LobbyMatchInstance extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      gameName: PropTypes.string.isRequired,
      matchID: PropTypes.string.isRequired,
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
      key={'button-join-' + inst.matchID}
      onClick={() =>
        this.props.onClickJoin(inst.gameName, inst.matchID, '' + seatId)
      }
    >
      Join
    </button>
  );

  _createButtonLeave = inst => (
    <button
      key={'button-leave-' + inst.matchID}
      onClick={() => this.props.onClickLeave(inst.gameName, inst.matchID)}
    >
      Leave
    </button>
  );

  _createButtonPlay = (inst, seatId) => (
    <button
      key={'button-play-' + inst.matchID}
      onClick={() =>
        this.props.onClickPlay(inst.gameName, {
          matchID: inst.matchID,
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
      key={'button-spectate-' + inst.matchID}
      onClick={() =>
        this.props.onClickPlay(inst.gameName, {
          matchID: inst.matchID,
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
      // already seated: waiting for match to start
      return this._createButtonLeave(inst);
    }
    if (freeSeat) {
      // at least 1 seat is available
      return this._createButtonJoin(inst, freeSeat.id);
    }
    // match is full
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
    const match = this.props.match;
    let status = 'OPEN';
    if (!match.players.find(player => !player.name)) {
      status = 'RUNNING';
    }
    return (
      <tr key={'line-' + match.matchID}>
        <td key={'cell-name-' + match.matchID}>{match.gameName}</td>
        <td key={'cell-status-' + match.matchID}>{status}</td>
        <td key={'cell-seats-' + match.matchID}>
          {match.players.map(this._createSeat).join(', ')}
        </td>
        <td key={'cell-buttons-' + match.matchID}>
          {this._createInstanceButtons(match)}
        </td>
      </tr>
    );
  }
}

export default LobbyMatchInstance;
