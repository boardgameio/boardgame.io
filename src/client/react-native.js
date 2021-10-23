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
 * @param {...object} multiplayer - Set to a falsy value or a transportFactory, e.g., SocketIO()
 * @param {...object} enhancer - Optional enhancer to send to the Redux store
 *
 * Returns:
 *   A React Native component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE.
 */
export function Client(opts) {
  const { game, numPlayers, board, multiplayer, enhancer } = opts;
  let { loading } = opts;

  // Component that is displayed before the client has synced
  // with the game master.
  if (loading === undefined) {
    const Loading = () => <></>;
    loading = Loading;
  }

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
      matchID: PropTypes.string,
      // The ID of the player associated with this client.
      // Only relevant in multiplayer.
      playerID: PropTypes.string,
      // This client's authentication credentials.
      // Only relevant in multiplayer.
      credentials: PropTypes.string,
    };

    static defaultProps = {
      matchID: 'default',
      playerID: null,
      credentials: null,
    };

    constructor(props) {
      super(props);

      this.client = RawClient({
        game,
        numPlayers,
        multiplayer,
        matchID: props.matchID,
        playerID: props.playerID,
        credentials: props.credentials,
        debug: false,
        enhancer,
      });
    }

    componentDidMount() {
      this.unsubscribe = this.client.subscribe(() => this.forceUpdate());
      this.client.start();
    }

    componentWillUnmount() {
      this.client.stop();
      this.unsubscribe();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.matchID != this.props.matchID) {
        this.client.updateMatchID(this.props.matchID);
      }
      if (prevProps.playerID != this.props.playerID) {
        this.client.updatePlayerID(this.props.playerID);
      }
      if (prevProps.credentials != this.props.credentials) {
        this.client.updateCredentials(this.props.credentials);
      }
    }

    render() {
      let _board = null;

      const state = this.client.getState();

      if (state === null) {
        return React.createElement(loading);
      }

      const { matchID, playerID, ...rest } = this.props;

      if (board) {
        _board = React.createElement(board, {
          ...state,
          ...rest,
          matchID,
          playerID,
          isMultiplayer: !!multiplayer,
          moves: this.client.moves,
          events: this.client.events,
          step: this.client.step,
          reset: this.client.reset,
          undo: this.client.undo,
          redo: this.client.redo,
          matchData: this.client.matchData,
          sendChatMessage: this.client.sendChatMessage,
          chatMessages: this.client.chatMessages,
        });
      }

      return _board;
    }
  };
}
