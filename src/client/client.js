/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import * as ActionCreators from '../core/action-creators';
import { Debug } from './debug/debug';
import { Multiplayer } from './multiplayer/multiplayer';
import { createGameReducer } from '../core/reducer';
import './client.css';

/**
 * createEventDispatchers
 *
 * Creates a set of dispatchers to dispatch game flow events.
 * @param {Array} eventNames - A list of event names.
 * @param {object} store - The Redux store to create dispatchers for.
 * @param {string} playerID - The ID of the player dispatching these events.
 */
export function createEventDispatchers(eventNames, store, playerID) {
  let dispatchers = {};
  for (const name of eventNames) {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators.gameEvent(name, args, playerID));
    };
  }
  return dispatchers;
}

/**
 * createMoveDispatchers
 *
 * Creates a set of dispatchers to make moves.
 * @param {Array} moveNames - A list of move names.
 * @param {object} store - The Redux store to create dispatchers for.
 */
export function createMoveDispatchers(moveNames, store, playerID) {
  let dispatchers = {};
  for (const name of moveNames) {
    dispatchers[name] = function(...args) {
      store.dispatch(ActionCreators.makeMove(name, args, playerID));
    };
  }
  return dispatchers;
}

/**
 * Client
 *
 * Main function used to a create a game client.
 *
 * @param {...object} game - The return value of `Game`.
 * @param {...object} numPlayers - The number of players.
 * @param {...object} board - The React component for the game.
 * @param {...object} multiplayer - Set to true or { server: '<host>:<port>' }
 *                                  to make a multiplayer client. The second
 *                                  syntax specifies a non-default socket server.
 * @param {...object} debug - Enables the Debug UI.
 *
 * Returns:
 *   A React component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE and END_TURN.
 */
export function Client({ game, numPlayers, board, multiplayer, debug }) {
  let server = undefined;
  if (multiplayer instanceof Object && 'server' in multiplayer) {
    server = multiplayer.server;
    multiplayer = true;
  }

  if (debug === undefined) debug = true;

  const GameReducer = createGameReducer({
    game,
    numPlayers,
    multiplayer,
  });

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

    state = {
      isConnected: false,
    };

    constructor(props) {
      super(props);

      this.store = null;

      if (multiplayer) {
        this.multiplayerClient = new Multiplayer({
          gameID: props.gameID,
          playerID: props.playerID,
          gameName: game.name,
          onChange: isConnected => {
            this.setState({ isConnected }), this.forceUpdate();
          },
          numPlayers,
          server,
        });
        this.store = this.multiplayerClient.createStore(GameReducer);
      } else {
        this.store = createStore(GameReducer);
      }

      this.moveAPI = createMoveDispatchers(
        game.moveNames,
        this.store,
        props.playerID
      );

      this.eventAPI = createEventDispatchers(
        game.flow.eventNames,
        this.store,
        props.playerID
      );

      this.createBoard();
      this.createDebugUI();
    }

    createBoard() {
      if (board) {
        const mapStateToProps = state => {
          let isActive = true;
          let G = state.G;

          if (multiplayer) {
            if (this.props.playerID == null) {
              isActive = false;
            }
            if (
              state.ctx.currentPlayer != 'any' &&
              this.props.playerID != state.ctx.currentPlayer
            ) {
              isActive = false;
            }
          }

          // Secrets are normally stripped on the server,
          // but we also strip them here so that game developers
          // can see their effects while prototyping.
          let playerID = this.props.playerID;
          if (!multiplayer && !playerID && state.ctx.currentPlayer != 'any') {
            playerID = state.ctx.currentPlayer;
          }
          G = game.playerView(G, state.ctx, playerID);

          if (state.ctx.gameover !== undefined) {
            isActive = false;
          }

          return { ...state, isActive, G };
        };

        const Board = connect(mapStateToProps, ActionCreators)(board);

        this._board = React.createElement(Board, {
          isMultiplayer: multiplayer === true,
          moves: this.moveAPI,
          events: this.eventAPI,
          gameID: this.props.gameID,
          playerID: this.props.playerID,
        });
      }
    }

    createDebugUI() {
      if (debug && this.props.debug) {
        this._debug = React.createElement(
          connect(state => ({ gamestate: state }), ActionCreators)(Debug),
          {
            isMultiplayer: multiplayer === true,
            moves: this.moveAPI,
            events: this.eventAPI,
            gameID: this.props.gameID,
            playerID: this.props.playerID,
          }
        );
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.multiplayerClient) {
        if (nextProps.gameID != this.props.gameID) {
          this.multiplayerClient.updateGameID(nextProps.gameID);
        }
        if (nextProps.playerID != this.props.playerID) {
          this.multiplayerClient.updatePlayerID(nextProps.playerID);
        }
      }

      this.moveAPI = createMoveDispatchers(
        game.moveNames,
        this.store,
        this.props.playerID
      );

      this.eventAPI = createEventDispatchers(
        game.flow.eventNames,
        this.store,
        this.props.playerID
      );

      this.createBoard();
      this.createDebugUI();
    }

    render() {
      const board =
        this._board &&
        React.cloneElement(this._board, {
          isConnected: this.state.isConnected,
        });

      const debug =
        this._debug &&
        React.cloneElement(this._debug, {
          isConnected: this.state.isConnected,
        });

      return (
        <div className="client">
          <Provider store={this.store}>
            <span>
              {debug}
              {board}
            </span>
          </Provider>
        </div>
      );
    }
  };
}
