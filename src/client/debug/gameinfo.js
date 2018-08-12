/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Item = props => (
  <div className="gameinfo-item">
    <strong>{props.name} </strong>
    <div>{JSON.stringify(props.value)}</div>
  </div>
);

Item.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
};

export const GameInfo = props => (
  <section className="gameinfo">
    <Item name="gameID" value={props.gameID} />
    <Item name="playerID" value={props.playerID} />
    <Item name="isActive" value={props.isActive} />
    {props.isMultiplayer && (
      <span>
        <Item name="isConnected" value={props.isConnected} />
        <Item name="isMultiplayer" value={props.isMultiplayer} />
      </span>
    )}
  </section>
);

GameInfo.propTypes = {
  gameID: PropTypes.string,
  playerID: PropTypes.string,
  isActive: PropTypes.bool,
  isConnected: PropTypes.bool,
  isMultiplayer: PropTypes.bool,
};
