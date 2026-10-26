/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import type { LobbyAPI } from '../types';

export type MatchOpts = {
  numPlayers: number;
  matchID: string;
  playerID?: string;
};

type Match = {
  gameName: string;
  matchID: string;
  players: LobbyAPI.Match['players'];
  status: LobbyAPI.Match['status'];
};

type MatchInstanceProps = {
  match: Match;
  playerName: string;
  onClickJoin: (gameName: string, matchID: string, playerID: string) => void;
  onClickLeave: (gameName: string, matchID: string) => void;
  onClickPlay: (gameName: string, matchOpts: MatchOpts) => void;
};

class LobbyMatchInstance extends React.Component<MatchInstanceProps> {
  _createSeat = (player: { name?: string }) => {
    return player.name || '[free]';
  };

  _createButtonJoin = (inst: Match, seatId: number) => (
    <button
      key={'button-join-' + inst.matchID}
      onClick={() =>
        this.props.onClickJoin(inst.gameName, inst.matchID, '' + seatId)
      }
    >
      Join
    </button>
  );

  _createButtonLeave = (inst: Match) => (
    <button
      key={'button-leave-' + inst.matchID}
      onClick={() => this.props.onClickLeave(inst.gameName, inst.matchID)}
    >
      Leave
    </button>
  );

  _createButtonPlay = (inst: Match, seatId: number) => (
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

  _createButtonSpectate = (inst: Match) => (
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

  _createInstanceButtons = (inst: Match) => {
    const playerSeat = inst.players.find(
      (player) => player.name === this.props.playerName,
    );
    const freeSeat = inst.players.find((player) => !player.name);
    // Already seated: wait while the match is open, play once it is running.
    if (playerSeat) {
      if (inst.status === 'open') {
        return this._createButtonLeave(inst);
      }
      return (
        <div>
          {[
            this._createButtonPlay(inst, playerSeat.id),
            this._createButtonLeave(inst),
          ]}
        </div>
      );
    }
    // at least 1 seat is available
    if (freeSeat) {
      return this._createButtonJoin(inst, freeSeat.id);
    }
    // allow spectating
    return this._createButtonSpectate(inst);
  };

  render() {
    const match = this.props.match;
    const status = match.status === 'running' ? 'RUNNING' : 'OPEN';
    return (
      <tr key={'line-' + match.matchID}>
        <td key={'cell-name-' + match.matchID}>{match.gameName}</td>
        <td key={'cell-status-' + match.matchID}>{status}</td>
        <td key={'cell-seats-' + match.matchID}>
          {match.players.map((player) => this._createSeat(player)).join(', ')}
        </td>
        <td key={'cell-buttons-' + match.matchID}>
          {this._createInstanceButtons(match)}
        </td>
      </tr>
    );
  }
}

export default LobbyMatchInstance;
