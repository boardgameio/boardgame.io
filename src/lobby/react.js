/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import PropTypes from 'prop-types';

import useLobby from './useLobby';
import LobbyLoginForm from './login-form';
import LobbyRoomInstance from './room-instance';
import LobbyCreateRoomForm from './create-room-form';

const LobbyPhases = {
  ENTER: 'enter',
  PLAY: 'play',
  LIST: 'list',
};

/**
 * Lobby
 *
 * React lobby component.
 *
 * @param {Array}  gameComponents - An array of Board and Game objects for the supported games.
 * @param {string} lobbyServer - Address of the lobby server (for example 'localhost:8000').
 *                               If not set, defaults to the server that served the page.
 * @param {string} gameServer - Address of the game server (for example 'localhost:8001').
 *                              If not set, defaults to the server that served the page.
 * @param {function} clientFactory - Function that is used to create the game clients.
 * @param {bool}   debug - Enable debug information (default: false).
 *
 * Returns:
 *   A React component that provides a UI to create, list, join, leave, play or spectate game instances.
 */
function Lobby(props) {
  const { gameComponents, renderer } = props;
  const { errorMsg, playerName, phase, runningGame, rooms, actions } = useLobby(
    props
  );

  function getPhaseVisibility(currentPhase) {
    return phase !== currentPhase ? 'hidden' : 'phase';
  }

  function renderRooms(rooms, playerName) {
    return rooms.map(room => {
      const { gameID, gameName, players } = room;
      return (
        <LobbyRoomInstance
          key={'instance-' + gameID}
          room={{ gameID, gameName, players: Object.values(players) }}
          playerName={playerName}
          onClickJoin={actions.joinRoom}
          onClickLeave={actions.leaveRoom}
          onClickPlay={actions.startGame}
        />
      );
    });
  }

  if (renderer) {
    return renderer({
      errorMsg,
      gameComponents,
      rooms,
      phase,
      playerName,
      runningGame,
      actions,
    });
  }

  return (
    <div id="lobby-view" style={{ padding: 50 }}>
      <div className={getPhaseVisibility(LobbyPhases.ENTER)}>
        <LobbyLoginForm
          key={playerName}
          playerName={playerName}
          onEnter={actions.enterLobby}
        />
      </div>

      <div className={getPhaseVisibility(LobbyPhases.LIST)}>
        <p>Welcome, {playerName}</p>

        <div className="phase-title" id="game-creation">
          <span>Create a room:</span>
          <LobbyCreateRoomForm
            games={gameComponents}
            createGame={actions.createRoom}
          />
        </div>
        <p className="phase-title">Join a room:</p>
        <div id="instances">
          <table>
            <tbody>{renderRooms(rooms, playerName)}</tbody>
          </table>
          <span className="error-msg">
            {errorMsg}
            <br />
          </span>
        </div>
        <p className="phase-title">
          Rooms that become empty are automatically deleted.
        </p>
      </div>

      <div className={getPhaseVisibility(LobbyPhases.PLAY)}>
        {runningGame && (
          <runningGame.app
            gameID={runningGame.gameID}
            playerID={runningGame.playerID}
            credentials={runningGame.credentials}
          />
        )}
        <div className="buttons" id="game-exit">
          <button onClick={actions.exitRoom}>Exit game</button>
        </div>
      </div>

      <div className="buttons" id="lobby-exit">
        <button onClick={actions.exitLobby}>Exit lobby</button>
      </div>
    </div>
  );
}

Lobby.propTypes = {
  gameComponents: PropTypes.array.isRequired,
  lobbyServer: PropTypes.string,
  gameServer: PropTypes.string,
  debug: PropTypes.bool,
  clientFactory: PropTypes.func,
};
