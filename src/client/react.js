/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Debug } from './debug/debug';
import { Client as RawClient } from './client';

/**
 * Client
 *
 * boardgame.io React client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} board - The React component for the game.
 * @param {...object} multiplayer - Set to true or { server: '<host>:<port>' }
 *                                  to make a multiplayer client. The second
 *                                  syntax specifies a non-default socket server.
 * @param {...object} debug - Enables the Debug UI.
 * @param {...object} enhancer - Optional enhancer to send to the Redux store
 *
 * Returns:
 *   A React component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE and END_TURN.
 */
export function Client({
  game,
  numPlayers,
  board,
  multiplayer,
  debug,
  enhancer,
}) {
  if (debug === undefined) debug = true;

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
      // Enable / disable the Debug UI.
      debug: PropTypes.bool,
    };

    static defaultProps = {
      gameID: 'default',
      playerID: null,
      debug: true,
    };

    constructor(props) {
      super(props);

      this.client = RawClient({
        game,
        numPlayers,
        multiplayer,
        gameID: props.gameID,
        playerID: props.playerID,
        enhancer,
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
      if (typeof window !== 'undefined') {
        this.client.connect();
      }
    }

    render() {
      let _board = null;
      let _debug = null;

      const state = this.client.getState();

      if (board) {
        _board = React.createElement(board, {
          ...state,
          isMultiplayer: multiplayer === true,
          moves: this.client.moves,
          events: this.client.events,
          gameID: this.props.gameID,
          playerID: this.props.playerID,
        });
      }

      if (debug && this.props.debug) {
        _debug = React.createElement(Debug, {
          gamestate: state,
          store: this.client.store,
          isMultiplayer: multiplayer === true,
          moves: this.client.moves,
          events: this.client.events,
          gameID: this.props.gameID,
          playerID: this.props.playerID,
        });
      }

      return (
        <div className="client">
          <span>
            {_debug}
            {_board}
          </span>
        </div>
      );
    }
  };
}
