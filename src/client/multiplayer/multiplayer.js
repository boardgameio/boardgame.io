/*
 * Copyright 2017 Google Inc.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as ActionCreators from '../../both/action-creators';
import { createStore, applyMiddleware } from 'redux';
import io from 'socket.io-client';

let gameid = 'default';
let socket = null;

function updateGameID(id) {
  gameid = id;

  if (socket) {
    socket.emit('sync', id);
  }
}

function setupMultiplayer(GameReducer, socketImpl) {
  let store = null;

  if (socketImpl !== undefined) {
    socket = socketImpl;
  } else {
    socket = io();
  }

  const whiteListedActions = {
    'MAKE_MOVE': true,
    'END_TURN': true,
  };

  // Redux middleware to emit a message on a socket
  // whenever an action is dispatched.
  const SocketUpdate = ({ getState }) => next => action => {
    const state = getState();
    const result = next(action);

    if (!action.remote && whiteListedActions[action.type]) {
      action.remote = true;
      action._id = state._id;
      action._gameid = gameid;
      socket.emit('action', action);
    }

    return result;
  }

  store = createStore(GameReducer, applyMiddleware(SocketUpdate));

  socket.on('action', action => {
    store.dispatch(action);
  });

  socket.on('sync', state => {
    store.dispatch(ActionCreators.restore(state));
  });

  return store;
}

export { setupMultiplayer, updateGameID, gameid }
