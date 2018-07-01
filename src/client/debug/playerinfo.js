/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component that renders information about the
 * players in the game (whose turn it is etc.).
 */
export class PlayerInfo extends React.Component {
  static propTypes = {
    ctx: PropTypes.any.isRequired,
    playerID: PropTypes.any,
    onClick: PropTypes.func,
  };

  onClick = playerID => {
    const arg = playerID == this.props.playerID ? null : playerID;
    this.props.onClick(arg);
  };

  render() {
    let players = [];
    for (let i = 0; i < this.props.ctx.numPlayers; i++) {
      const playerID = i + '';

      let className = 'player';

      if (playerID === this.props.ctx.currentPlayer) {
        className += ' current';
      }

      if (playerID === this.props.playerID) {
        className += ' active';
      }

      players.push(
        <div
          className={className}
          key={i}
          onClick={() => this.onClick(playerID)}
        >
          {playerID}
        </div>
      );
    }

    return <div className="player-box">{players}</div>;
  }
}
