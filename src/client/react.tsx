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
import type { ClientOpts, ClientState, _ClientImpl } from './client';
import type { Ctx } from '../types';

type WrappedBoardDelegates = 'matchID' | 'playerID' | 'credentials';

export type WrappedBoardProps = Pick<
  ClientOpts,
  WrappedBoardDelegates | 'debug'
>;

type ExposedClientProps<G extends any = any> = Pick<
  _ClientImpl<G>,
  | 'log'
  | 'moves'
  | 'events'
  | 'reset'
  | 'undo'
  | 'redo'
  | 'playerID'
  | 'matchID'
  | 'matchData'
  | 'sendChatMessage'
  | 'chatMessages'
>;

export type BoardProps<G extends any = any> = ClientState<G> &
  Omit<WrappedBoardProps, keyof ExposedClientProps<G>> &
  ExposedClientProps<G> & {
    isMultiplayer: boolean;
  };

type ReactClientOpts<
  G extends any = any,
  P extends BoardProps<G> = BoardProps<G>,
  CtxWithPlugins extends Ctx = Ctx
> = Omit<ClientOpts<G, CtxWithPlugins>, WrappedBoardDelegates> & {
  board?: React.ComponentType<P>;
  loading?: React.ComponentType;
};

/**
 * Client
 *
 * boardgame.io React client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} board - The React component for the game.
 * @param {...object} loading - (optional) The React component for the loading state.
 * @param {...object} multiplayer - Set to a falsy value or a transportFactory, e.g., SocketIO()
 * @param {...object} debug - Enables the Debug UI.
 * @param {...object} enhancer - Optional enhancer to send to the Redux store
 *
 * Returns:
 *   A React component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE, GAME_EVENT, RESET,
 *   UNDO and REDO.
 */
export function Client<
  G extends any = any,
  P extends BoardProps<G> = BoardProps<G>,
  ContextWithPlugins extends Ctx = Ctx
>(opts: ReactClientOpts<G, P, ContextWithPlugins>) {
  let { game, numPlayers, loading, board, multiplayer, enhancer, debug } = opts;

  // Component that is displayed before the client has synced
  // with the game master.
  if (loading === undefined) {
    const Loading = () => <div className="bgio-loading">connecting...</div>;
    loading = Loading;
  }

  type AdditionalProps = Omit<P, keyof BoardProps<G>>;

  /*
   * WrappedBoard
   *
   * The main React component that wraps the passed in
   * board component and adds the API to its props.
   */
  return class WrappedBoard extends React.Component<
    WrappedBoardProps & AdditionalProps
  > {
    client: _ClientImpl<G>;
    unsubscribe?: () => void;

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
      // Enable / disable the Debug UI.
      debug: PropTypes.any,
    };

    static defaultProps = {
      matchID: 'default',
      playerID: null,
      credentials: null,
      debug: true,
    };

    constructor(props: WrappedBoardProps & AdditionalProps) {
      super(props);

      if (debug === undefined) {
        debug = props.debug;
      }

      this.client = RawClient({
        game,
        debug,
        numPlayers,
        multiplayer,
        matchID: props.matchID,
        playerID: props.playerID,
        credentials: props.credentials,
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

    componentDidUpdate(prevProps: WrappedBoardProps & AdditionalProps) {
      if (this.props.matchID != prevProps.matchID) {
        this.client.updateMatchID(this.props.matchID);
      }
      if (this.props.playerID != prevProps.playerID) {
        this.client.updatePlayerID(this.props.playerID);
      }
      if (this.props.credentials != prevProps.credentials) {
        this.client.updateCredentials(this.props.credentials);
      }
    }

    render() {
      const state = this.client.getState();

      if (state === null) {
        return React.createElement(loading);
      }

      let _board = null;

      if (board) {
        _board = React.createElement(board, {
          ...state,
          ...(this.props as P),
          isMultiplayer: !!multiplayer,
          moves: this.client.moves,
          events: this.client.events,
          matchID: this.client.matchID,
          playerID: this.client.playerID,
          reset: this.client.reset,
          undo: this.client.undo,
          redo: this.client.redo,
          log: this.client.log,
          matchData: this.client.matchData,
          sendChatMessage: this.client.sendChatMessage,
          chatMessages: this.client.chatMessages,
        });
      }

      return <div className="bgio-client">{_board}</div>;
    }
  };
}
