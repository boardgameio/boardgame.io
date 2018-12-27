/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Lobby from './react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('lobby', () => {
  let lobby;
  let spy = jest.fn();

  beforeEach(async () => {
    const comps = [
      { board: 'Board1', game: { name: 'GameName1' } },
      {
        board: 'Board2',
        game: { name: 'GameName2', minPlayers: 2, maxPlayers: 3 },
      },
      {
        board: 'Board3',
        game: { name: 'GameName3', maxPlayers: 1 },
      },
    ];
    lobby = Enzyme.mount(
      <Lobby
        server="localhost"
        port={8001}
        gameComponents={comps}
        playerName="Bob"
        onStartGame={spy.bind(this)}
        onExitLobby={spy.bind(this)}
      />
    );
  });

  afterEach(() => {
    spy.mockReset();
  });

  describe('creating a room', () => {
    beforeEach(async () => {
      lobby.instance().connection.gameInstances = [
        {
          gameID: 'gameID1',
          players: { '0': { id: 0 } },
          gameName: 'GameName1',
        },
      ];
      lobby.instance().forceUpdate();
      lobby.update();
    });
    test('room with 2 players', () => {
      lobby.instance().connection.create = spy.mockReturnValue(true);
      lobby
        .find('LobbyCreateRoomForm')
        .find('select')
        .first()
        .props()
        .onChange({ target: { value: '1' } });
      lobby
        .find('LobbyCreateRoomForm')
        .find('select')
        .at(1)
        .props()
        .onChange({ target: { value: '2' } });
      lobby
        .find('LobbyCreateRoomForm')
        .find('button')
        .simulate('click');
      expect(spy).toHaveBeenCalledWith('GameName2', 2);
    });
    test('when server request fails', async () => {
      lobby.instance().connection.create = spy.mockReturnValue(false);
      await lobby
        .find('LobbyCreateRoomForm')
        .find('button')
        .simulate('click');
      expect(lobby.find('.error-msg').text()).not.toBe('');
    });
    test('when game has no boundaries on the number of players', async () => {
      expect(
        lobby
          .find('LobbyCreateRoomForm')
          .find('select')
          .at(1)
          .text()
      ).toBe('1234');
    });
    test('when game has boundaries on the number of players', async () => {
      // select 2nd game
      lobby
        .find('LobbyCreateRoomForm')
        .find('select')
        .first()
        .props()
        .onChange({ target: { value: '1' } });
      expect(
        lobby
          .find('LobbyCreateRoomForm')
          .find('select')
          .at(1)
          .text()
      ).toBe('23');
    });
  });

  describe('joining a room', () => {
    beforeEach(async () => {
      lobby.instance().connection.gameInstances = [
        {
          gameID: 'gameID1',
          players: { '0': { id: 0 } },
          gameName: 'GameName1',
        },
        {
          gameID: 'gameID2',
          players: { '0': { id: 0, name: 'Bob' } },
          gameName: 'GameName1',
        },
      ];
      lobby.instance().forceUpdate();
      lobby.update();
    });
    test('when room is empty', () => {
      // join 1st room
      lobby.instance().connection.join = spy.mockReturnValue(true);
      lobby
        .find('LobbyRoomInstance')
        .first()
        .find('button')
        .simulate('click');
      expect(spy).toHaveBeenCalledWith('GameName1', 'gameID1', '0');
    });
    test('when room is full', () => {
      // try 2nd room
      expect(
        lobby
          .find('LobbyRoomInstance')
          .at(1)
          .text()
      ).toContain('RUNNING');
    });
    test('when server request fails', async () => {
      lobby.instance().connection.join = spy.mockReturnValue(false);
      // join 1st room
      await lobby
        .find('LobbyRoomInstance')
        .first()
        .find('button')
        .simulate('click');
      expect(lobby.find('.error-msg').text()).not.toBe('');
    });
  });

  describe('leaving a room', () => {
    beforeEach(async () => {
      lobby.instance().connection.gameInstances = [
        {
          gameID: 'gameID1',
          players: {
            '0': { id: 0, name: 'Bob' },
            '1': { id: 1 },
          },
          gameName: 'GameName1',
        },
      ];
      lobby.instance().forceUpdate();
      lobby.update();
    });
    test('shall leave a room', () => {
      // leave room
      lobby.instance().connection.leave = spy.mockReturnValue(true);
      lobby
        .find('LobbyRoomInstance')
        .find('button')
        .simulate('click');
      expect(spy).toHaveBeenCalledWith('GameName1', 'gameID1');
    });
    test('when server request fails', async () => {
      lobby.instance().connection.leave = spy.mockReturnValue(false);
      await lobby
        .find('LobbyRoomInstance')
        .find('button')
        .simulate('click');
      expect(lobby.find('.error-msg').text()).not.toBe('');
    });
  });

  describe('starting a game', () => {
    beforeEach(async () => {
      lobby.instance().connection.gameInstances = [
        {
          gameID: 'gameID1',
          players: {
            '0': { id: 0, name: 'Bob', credentials: 'SECRET1' },
            '1': { id: 1, name: 'Charly', credentials: 'SECRET2' },
          },
          gameName: 'GameName1',
        },
        {
          gameID: 'gameID2',
          players: { '0': { id: 0, name: 'Alice' } },
          gameName: 'GameName2',
        },
        {
          gameID: 'gameID3',
          players: { '0': { id: 0, name: 'Bob' } },
          gameName: 'GameName3',
        },
        {
          gameID: 'gameID4',
          players: { '0': { id: 0, name: 'Zoe' } },
          gameName: 'GameNameUnknown',
        },
      ];
      lobby.instance().forceUpdate();
      lobby.update();
    });
    test('if player has joined the game', () => {
      lobby.instance().connection.playerCredentials = 'SECRET1';
      lobby
        .find('LobbyRoomInstance')
        .first()
        .find('button')
        .simulate('click');
      expect(spy).toHaveBeenCalledWith(expect.anything(), {
        gameID: 'gameID1',
        playerID: '0',
        playerCredentials: 'SECRET1',
        numPlayers: 2,
      });
    });
    test('if player is spectator', () => {
      lobby
        .find('LobbyRoomInstance')
        .at(1)
        .find('button')
        .simulate('click');
      expect(spy).toHaveBeenCalledWith(expect.anything(), {
        gameID: 'gameID2',
        numPlayers: 1,
      });
    });
    test('if game is not supported', () => {
      lobby
        .find('LobbyRoomInstance')
        .at(3)
        .find('button')
        .simulate('click');
      expect(spy).not.toHaveBeenCalled();
      expect(lobby.find('.error-msg').text()).not.toBe('');
    });
    test('if game is monoplayer', () => {
      lobby
        .find('LobbyRoomInstance')
        .at(2)
        .find('button')
        .simulate('click');
      expect(spy).not.toHaveBeenCalledWith(expect.anything(), {
        gameID: 'gameID3',
      });
    });
  });

  test('changing prop playerName', () => {
    lobby.setProps({
      playerName: 'Zoe',
    });
    expect(lobby.instance().connection.playerName).toBe('Zoe');
  });
  test('changing prop debug', () => {
    lobby.setProps({
      debug: !lobby.props().debug,
    });
  });

  describe('exiting lobby', () => {
    beforeEach(async () => {
      lobby.instance().connection.gameInstances = [
        {
          gameID: 'gameID1',
          players: {
            '0': { id: 0, name: 'Bob' },
            '1': { id: 1 },
          },
          gameName: 'GameName1',
        },
      ];
      lobby.instance().forceUpdate();
      lobby.update();
    });
    test('if player had joined no room', async () => {
      lobby.instance().connection.disconnect = spy.mockReturnValue(true);
      lobby
        .find('button')
        .at(2)
        .simulate('click');
      expect(spy).toHaveBeenCalledWith();
    });
    test('after player has joined a room', async () => {
      lobby.instance().connection.disconnect = spy.mockReturnValue(true);
      lobby
        .find('button')
        .at(2)
        .simulate('click');
      expect(spy).toHaveBeenCalledWith();
    });
  });
});
