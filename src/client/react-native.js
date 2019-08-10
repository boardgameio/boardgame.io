/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Client as RawClient } from './client';

/**
 * Client
 *
 * boardgame.io React Native client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} board - The React component for the game.
 * @param {...object} loading - (optional) The React component for the loading state.
 * @param {...object} multiplayer - Set to true or { server: '<host>:<port>' }
 *                                  to make a multiplayer client. The second
 *                                  syntax specifies a non-default socket server.
 * @param {...object} enhancer - Optional enhancer to send to the Redux store
 *
 * Returns:
 *   A React Native component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE.
 */
export function Client(opts) {
  let { game, numPlayers, board, multiplayer, enhancer } = opts;

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
      // This client's authentication credentials.
      // Only relevant in multiplayer.
      credentials: PropTypes.string,
    };

    static defaultProps = {
      gameID: 'default',
      playerID: null,
      credentials: null,
    };

    constructor(props) {
      super(props);

      this.client = RawClient({
        game,
        numPlayers,
        multiplayer,
        gameID: props.gameID,
        playerID: props.playerID,
        credentials: props.credentials,
        socketOpts: {
          transports: ['websocket'],
        },
        enhancer,
      });

      this.client.subscribe(() => this.forceUpdate());
    }

    // eslint-disable-next-line react/no-deprecated
    componentWillReceiveProps(nextProps) {
      if (nextProps.gameID != this.props.gameID) {
        this.client.updateGameID(nextProps.gameID);
      }
      if (nextProps.playerID != this.props.playerID) {
        this.client.updatePlayerID(nextProps.playerID);
      }
      if (nextProps.credentials != this.props.credentials) {
        this.client.updateCredentials(nextProps.credentials);
      }
    }

    // eslint-disable-next-line react/no-deprecated
    componentWillMount() {
      this.client.connect();
    }

    render() {
      let _board = null;

      const state = this.client.getState();
      const { gameID, playerID, ...rest } = this.props;

      if (board) {
        _board = React.createElement(board, {
          ...state,
          ...rest,
          gameID,
          playerID,
          isMultiplayer: multiplayer !== undefined,
          moves: this.client.moves,
          events: this.client.events,
          step: this.client.step,
          reset: this.client.reset,
          undo: this.client.undo,
          redo: this.client.redo,
          gameMetadata: this.client.gameMetadata,
        });
      }

      return _board;
    }
  };
}
