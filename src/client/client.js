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
import { createEventDispatchers } from '../core/flow';
import { createGameReducer, createMoveDispatchers } from '../core/reducer';
import './client.css';

/*
 * client
 *
 * Main function used to a register a game client.
 *
 * Args:
 *   G     - The initial game state.
 *   moves - The game move reducer.
 *   board - React component to render your game.
 *
 * Returns:
 *   A React component that wraps board and provides an
 *   API through props for it to interact with the framework
 *   and dispatch actions such as MAKE_MOVE and END_TURN.
 */
function Client({game, numPlayers, board, multiplayer, debug}) {
  if (!multiplayer)        multiplayer = false;
  if (debug === undefined) debug = true;

  const GameReducer = createGameReducer({game, numPlayers});

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
      debug: PropTypes.bool
    }

    static defaultProps = {
      gameID: 'default',
      playerID: null,
      debug: true
    }

    constructor(props) {
      super(props);

      this.store = null;

      if (multiplayer) {
        this.multiplayerClient = new Multiplayer(
            undefined, props.gameID, props.playerID);
        this.store = this.multiplayerClient.createStore(GameReducer);
      } else {
        this.store = createStore(GameReducer);
      }

      this.moveAPI = createMoveDispatchers(game.moveNames, this.store);
      this.gameAPI = createEventDispatchers(game.flow.eventNames, this.store);
      this.createBoard();
      this.createDebugUI();

      this.store.subscribe(() => {
        this.setState(this.store.getState());
      });
    }

    createBoard() {
      if (board) {
        const mapStateToProps = state => {
          let isActive = true;

          if (multiplayer) {
            if (this.props.playerID == null) {
              isActive = false;
            }
            if (state.ctx.currentPlayer != 'any' &&
                this.props.playerID != state.ctx.currentPlayer) {
              isActive = false;
            }
          }

          if (state.ctx.winner !== null) {
            isActive = false;
          }

          return { ...state, isActive };
        };

        const Board =
            connect(mapStateToProps, ActionCreators)(board);

        this._board = React.createElement(Board, {
          moves: this.moveAPI,
          game: this.gameAPI,
          gameID: this.props.gameID,
          playerID: this.props.playerID,
        });
      }
    }

    createDebugUI() {
      if (debug && this.props.debug) {
        this._debug = React.createElement(
          connect(state => ({ gamestate: state}),
                  ActionCreators)(Debug),
          {
            moves: this.moveAPI,
            game: this.gameAPI,
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

      this.createBoard();
      this.createDebugUI();
    }

    componentWillMount() {
      this.setState(this.store.getState());
    }

    render() {
      return (
        <div className='client'>
          <Provider store={this.store}>
            <span>
            {this._debug}
            {this._board}
            </span>
          </Provider>
        </div>
      );
    }
  };
}

export default Client;
