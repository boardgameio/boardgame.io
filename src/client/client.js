/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import * as ActionCreators from '../both/action-creators';
import { Debug } from './debug/debug';
import { Multiplayer } from './multiplayer/multiplayer';
import { createGameReducer, createDispatchers } from '../both/reducer';
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
      gameid: PropTypes.string,
      // The ID of the player associated with this client.
      // Only relevant in multiplayer.
      player: PropTypes.string
    }

    static defaultProps = {
      gameid: 'default',
      player: null
    }

    constructor(props) {
      super(props);

      this.store = null;

      if (multiplayer) {
        this.multiplayerClient = new Multiplayer(
            undefined, props.gameid, props.player);
        this.store = this.multiplayerClient.createStore(GameReducer);
      } else {
        this.store = createStore(GameReducer);
      }

      const moveAPI = createDispatchers(game.moveNames, this.store);

      if (board) {
        this._board = React.createElement(
          connect(state => state, ActionCreators)(board),
          { moves: moveAPI }
        );
      }

      if (debug) {
        this._debug = React.createElement(
          connect(state => ({ gamestate: state}),
                  ActionCreators)(Debug),
          {
            moveAPI,
            gameid: props.gameid,
            player: props.player,
          }
        );
      }

      this.store.subscribe(() => {
        this.setState(this.store.getState());
      });
    }

    componentWillReceiveProps(nextProps) {
      if (this.multiplayerClient) {
        if (nextProps.gameid != this.props.gameid) {
          this.multiplayerClient.updateGameID(nextProps.gameid);
        }
        if (nextProps.player != this.props.player) {
          this.multiplayerClient.updatePlayer(nextProps.player);
        }
      }
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

export { createDispatchers };
export default Client;
