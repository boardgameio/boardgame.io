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
    const comps = {
      game1: { board: 'Board1', game: { name: 'GameName1' } },
      game2: { board: 'Board2', game: { name: 'GameName2' } },
    };
    lobby = Enzyme.mount(
      <Lobby
        server="localhost"
        port={8001}
        gameComponents={comps}
        playerName="Bob"
        onStartGame={spy.bind(this)}
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
    });
    test('room with 2 players', () => {
      lobby.instance().connection.create = spy;
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
    });
    test('when room is empty', () => {
      lobby
        .find('LobbyCreateRoomForm')
        .find('button')
        .simulate('click');
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
      lobby
        .find('LobbyCreateRoomForm')
        .find('button')
        .simulate('click');
      // try 2nd room
      expect(
        lobby
          .find('LobbyRoomInstance')
          .at(1)
          .text()
      ).toContain('RUNNING');
    });
    test('when server request fails', () => {
      lobby
        .find('LobbyCreateRoomForm')
        .find('button')
        .simulate('click');
      // join 1st room
      lobby.instance().connection.join = spy.mockReturnValue(false);
      lobby
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
      lobby
        .find('LobbyCreateRoomForm')
        .find('button')
        .simulate('click');
      lobby
        .find('LobbyRoomInstance')
        .find('button')
        .simulate('click');
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
    test('when server request fails', () => {
      lobby.instance().connection.leave = spy.mockReturnValue(false);
      lobby
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
          players: { '0': { id: 0, name: 'Bob', credentials: 'SECRET1' } },
          gameName: 'GameName1',
        },
        {
          gameID: 'gameID2',
          players: { '0': { id: 0, name: 'Alice' } },
          gameName: 'GameName2',
        },
        {
          gameID: 'gameID3',
          players: { '0': { id: 0, name: 'Zoe' } },
          gameName: 'GameName3',
        },
      ];
      lobby
        .find('LobbyCreateRoomForm')
        .find('button')
        .simulate('click');
    });
    test('shall instantiate a game client', () => {
      lobby
        .find('LobbyRoomInstance')
        .first()
        .find('button')
        .simulate('click');
      expect(spy).toHaveBeenCalledWith(expect.anything(), {
        playerID: '0',
        gameID: 'gameID1',
        playerCredentials: 'SECRET1',
      });
    });
    test('shall instantiate a game client for spectator', () => {
      lobby
        .find('LobbyRoomInstance')
        .at(1)
        .find('button')
        .simulate('click');
      expect(spy).toHaveBeenCalledWith(expect.anything(), {
        gameID: 'gameID2',
      });
    });
    test('shall display error if game not supported', () => {
      lobby
        .find('LobbyRoomInstance')
        .at(2)
        .find('button')
        .simulate('click');
      expect(spy).not.toHaveBeenCalled();
      expect(lobby.find('.error-msg').text()).not.toBe('');
    });
  });
});
