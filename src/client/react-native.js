/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Client } from './client';

/**
 * Client
 *
 * boardgame.io React Native client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} board - The React component for the game.
 * @param {...object} multiplayer - Set to true or { server: '<host>:<port>' }
 *                                  to make a multiplayer client. The second
 *                                  syntax specifies a non-default socket server.
 *
 * Returns:
 *   A React Native component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE.
 */
export function ReactNativeClient({ game, numPlayers, board, multiplayer }) {
  /*
   * WrappedBoard
   *
   * The main React component that wraps the passed in
   * board component and adds the API to its props.
   */
  return class WrappedBoard extends React.Component {
    static propTypes = {
      // The ID of a game to connect to.
      // Only relevant in multiplayer.
      gameID: PropTypes.string,
      // The ID of the player associated with this client.
      // Only relevant in multiplayer.
      playerID: PropTypes.string,
    };

    static defaultProps = {
      gameID: 'default',
      playerID: null,
    };

    constructor(props) {
      super(props);

      this.client = Client({
        game,
        numPlayers,
        multiplayer,
        gameID: props.gameID,
        playerID: props.playerID,
      });

      this.client.subscribe(() => this.forceUpdate());
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.gameID != this.props.gameID) {
        this.client.updateGameID(nextProps.gameID);
      }
      if (nextProps.playerID != this.props.playerID) {
        this.client.updatePlayerID(nextProps.playerID);
      }
    }

    componentWillMount() {
      this.client.connect();
    }

    render() {
      let _board = null;

      const state = this.client.getState();

      if (board) {
        _board = React.createElement(board, {
          ...state,
          isMultiplayer: multiplayer !== undefined,
          moves: this.client.moves,
          events: this.client.events,
          gameID: this.props.gameID,
          playerID: this.props.playerID,
        });
      }

      return _board;
    }
  };
}
