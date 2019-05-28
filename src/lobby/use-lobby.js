/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { useState, useEffect } from 'react';
import Cookies from 'react-cookies';
import { Client } from '../client/react';
import { LobbyConnection } from './connection';

const LobbyPhases = {
  ENTER: 'enter',
  PLAY: 'play',
  LIST: 'list',
};

function createConnection(name, playerCredentials, props) {
  return LobbyConnection({
    server: props.lobbyServer,
    gameComponents: props.gameComponents,
    playerName: name,
    playerCredentials,
  });
}

function useLobby(props) {
  const [state, setState] = useState({
    connection: null,
    phase: LobbyPhases.ENTER,
    playerName: 'Visitor',
    runningGame: null,
    errorMsg: '',
    credentialStore: {},
  });

  async function updateConnection(connection = state.connection) {
    if (!connection) {
      return;
    }

    setState({
      ...state,
      connection: await connection.result(),
    });
  }

  useEffect(() => {
    const connection = createConnection(props);
    updateConnection(connection);

    // Probably should be in a hook too
    let cookie = Cookies.load('lobbyState') || {};
    if (cookie.phase && cookie.phase === LobbyPhases.PLAY) {
      cookie.phase = LobbyPhases.LIST;
    }
    setState({
      phase: cookie.phase || LobbyPhases.ENTER,
      playerName: cookie.playerName || 'Visitor',
      credentialStore: cookie.credentialStore || {},
    });
  }, []);

  useEffect(
    () => {
      updateConnection(createConnection(props));

      let cookie = {
        phase: state.phase,
        playerName: name,
        credentialStore: state.credentialStore,
      };
      Cookies.save('lobbyState', cookie, { path: '/' });
    },
    [state.phase, state.credentialStore[state.name], state.name]
  );

  function updateCredentials(playerName, credentials) {
    setState({
      ...state,
      credentialStore: {
        ...state.credentialStore,
        [playerName]: credentials,
      },
    });
  }

  function enterLobby(playerName) {}

  async function exitLobby() {}

  async function createRoom(gameName, numPlayers) {
    const { connection } = state;
    try {
      await connection.create(gameName, numPlayers);

      return updateConnection(connection);
    } catch (error) {
      setState({ errorMsg: error.message });
    }
  }

  async function joinRoom(gameName, gameID, playerID) {
    const { connection } = state;
    try {
      await connection.join(gameName, gameID, playerID);
      await updateConnection(connection);
      return updateCredentials(
        connection.playerName,
        connection.playerCredentials
      );
    } catch (error) {
      setState({ errorMsg: error.message });
    }
  }

  async function leaveRoom(gameName, gameID) {
    const { connection } = state;
    try {
      await connection.leave(gameName, gameID);
      await updateConnection(connection);
      return updateCredentials(
        connection.playerName,
        connection.playerCredentials
      );
    } catch (error) {
      setState({ errorMsg: error.message });
    }
  }

  function startGame(gameName, gameOpts) {
    const connection = state.connection;
    const gameCode = connection._getGameComponents(gameName);
    if (!gameCode) {
      setState({
        errorMsg: 'game ' + gameName + ' not supported',
      });
      return;
    }

    let multiplayer = undefined;
    if (gameOpts.numPlayers > 1) {
      if (props.gameServer) {
        multiplayer = { server: props.gameServer };
      } else {
        multiplayer = true;
      }
    }

    const app = props.clientFactory({
      game: gameCode.game,
      board: gameCode.board,
      debug: props.debug,
      multiplayer,
    });

    const game = {
      app: app,
      gameID: gameOpts.gameID,
      playerID: gameOpts.numPlayers > 1 ? gameOpts.playerID : null,
      credentials: connection.playerCredentials,
    };

    setState({ phase: LobbyPhases.PLAY, runningGame: game });
  }

  function exitRoom() {
    setState({ phase: LobbyPhases.LIST, runningGame: null });
  }

  return {
    ...props,
    ...state,
    rooms: state.connection.rooms,
    actions: {
      enterLobby,
      exitLobby,
      createRoom,
      joinRoom,
      leaveRoom,
      exitRoom,
      updateConnection,
      startGame,
    },
  };
}

export default useLobby;
