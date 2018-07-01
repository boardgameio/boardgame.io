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
 *   and dispatch actions such as MAKE_MOVE, GAME_EVENT, RESET,
 *   UNDO and REDO.
 */
export function Client({
  game,
  numPlayers,
  board,
  multiplayer,
  ai,
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
      // This client's authentication credentials.
      // Only relevant in multiplayer.
      credentials: PropTypes.string,
      // Enable / disable the Debug UI.
      debug: PropTypes.bool,
    };

    static defaultProps = {
      gameID: 'default',
      playerID: null,
      credentials: null,
      debug: true,
    };

    state = {
      gameStateOverride: null,
    };

    constructor(props) {
      super(props);

      this.client = RawClient({
        game,
        ai,
        numPlayers,
        multiplayer,
        gameID: props.gameID,
        playerID: props.playerID,
        credentials: props.credentials,
        enhancer,
      });

      this.gameID = props.gameID;
      this.playerID = props.playerID;
      this.credentials = props.credentials;

      this.client.subscribe(() => this.forceUpdate());
    }

    componentDidUpdate(prevProps) {
      if (this.props.gameID != prevProps.gameID) {
        this.updateGameID(this.props.gameID);
      }
      if (this.props.playerID != prevProps.playerID) {
        this.updatePlayerID(this.props.playerID);
      }
      if (this.props.credentials != prevProps.credentials) {
        this.updateCredentials(this.props.credentials);
      }
    }

    updateGameID = gameID => {
      this.client.updateGameID(gameID);
      this.gameID = gameID;
      this.forceUpdate();
    };

    updatePlayerID = playerID => {
      this.client.updatePlayerID(playerID);
      this.playerID = playerID;
      this.forceUpdate();
    };

    updateCredentials = credentials => {
      this.client.updateCredentials(credentials);
      this.credentials = credentials;
      this.forceUpdate();
    };

    componentDidMount() {
      this.client.connect();
    }

    overrideGameState = state => {
      this.setState({ gameStateOverride: state });
    };

    render() {
      let _board = null;
      let _debug = null;

      let state = this.client.getState();
      const { debug: debugProp, ...rest } = this.props;

      if (this.state.gameStateOverride) {
        state = { ...state, ...this.state.gameStateOverride };
      }

      if (board) {
        _board = React.createElement(board, {
          ...state,
          isMultiplayer: multiplayer !== undefined,
          moves: this.client.moves,
          events: this.client.events,
          gameID: this.gameID,
          playerID: this.playerID,
          reset: this.client.reset,
          undo: this.client.undo,
          redo: this.client.redo,
          ...rest,
        });
      }

      if (debug && debugProp) {
        _debug = React.createElement(Debug, {
          gamestate: state,
          reducer: this.client.reducer,
          store: this.client.store,
          isMultiplayer: multiplayer !== undefined,
          moves: this.client.moves,
          events: this.client.events,
          gameID: this.gameID,
          playerID: this.playerID,
          credentials: this.credentials,
          step: this.client.step,
          reset: this.client.reset,
          undo: this.client.undo,
          redo: this.client.redo,
          visualizeAI: ai && ai.visualize,
          overrideGameState: this.overrideGameState,
          updateGameID: this.updateGameID,
          updatePlayerID: this.updatePlayerID,
          updateCredentials: this.updateCredentials,
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
