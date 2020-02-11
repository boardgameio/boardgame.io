/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import Cookies from 'react-cookies';
import Lobby from './react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

/* mock server requests */
global.fetch = jest.fn().mockReturnValue({ status: 200, json: () => [] });

/* mock 'Client' component */
function NullComponent() {
  return '<noscript />';
}

Enzyme.configure({ adapter: new Adapter() });

describe('lobby', () => {
  let lobby;
  let spy = jest.fn();
  let components;

  beforeEach(async () => {
    components = [
      {
        board: 'Board1',
        game: { name: 'GameName1', minPlayers: 3, maxPlayers: 5 },
      },
      { board: 'Board2', game: { name: 'GameName2' } },
      {
        board: 'Board3',
        game: { name: 'GameName3', maxPlayers: 1 },
      },
    ];
  });

  afterEach(() => {
    spy.mockReset();
  });

  describe('specify servers', () => {
    test('gameServer', () => {
      const spy = jest.fn();
      const lobby = Enzyme.mount(
        <Lobby
          gameComponents={components}
          clientFactory={spy.mockReturnValue(NullComponent)}
          gameServer="localhost:9000"
        />
      );
      lobby.instance()._startGame('GameName1', { numPlayers: 2 });
      expect(spy).toBeCalledWith(
        expect.objectContaining({
          multiplayer: expect.anything(),
        })
      );
    });
  });

  describe('login/logout', () => {
    beforeEach(async () => {
      lobby = Enzyme.mount(<Lobby gameComponents={components} />);
    });

    test('changing prop debug', () => {
      lobby.setProps({
        debug: !lobby.props().debug,
      });
    });

    describe('login succeeds', () => {
      beforeEach(async () => {
        lobby
          .find('LobbyLoginForm')
          .find('input')
          .props()
          .onChange({ target: { value: 'Mark' } });
      });
      test('by clicking', () => {
        lobby
          .find('LobbyLoginForm')
          .find('button')
          .simulate('click');
        expect(lobby.instance().state.playerName).toBe('Mark');
      });
      test('by pressing enter', () => {
        lobby
          .find('LobbyLoginForm')
          .find('input')
          .props()
          .onKeyPress({ key: 'Enter' });
        expect(lobby.instance().state.playerName).toBe('Mark');
      });
    });

    describe('login fails', () => {
      test('if no name entered', () => {
        lobby
          .find('LobbyLoginForm')
          .find('input')
          .props()
          .onChange({ target: { value: '' } });
        lobby
          .find('LobbyLoginForm')
          .find('button')
          .simulate('click');
        expect(
          lobby
            .find('LobbyLoginForm')
            .find('.error-msg')
            .text()
        ).not.toBe('');
      });
      test('invalid key press', () => {
        lobby
          .find('LobbyLoginForm')
          .find('input')
          .props()
          .onKeyPress({ key: 'Wololo' });
      });
    });

    describe('exiting lobby', () => {
      beforeEach(async () => {
        lobby.instance().connection.rooms = [
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
      test('disconnect from server', async () => {
        lobby.instance().connection.disconnect = spy;
        lobby
          .find('#lobby-exit')
          .find('button')
          .simulate('click');
        expect(spy).toHaveBeenCalledWith();
      });
    });
  });

  describe('refresh during game', () => {
    beforeEach(async () => {
      // initial state = phase 'play'
      Cookies.save(
        'lobbyState',
        {
          phase: 'play',
          playerName: 'Bob',
        },
        { path: '/' }
      );
      lobby = Enzyme.mount(<Lobby gameComponents={components} />);
    });
    test('reset phase to list', async () => {
      expect(lobby.instance().state.phase).toBe('list');
    });
  });

  describe('rooms list', () => {
    let spyClient = jest.fn();
    beforeEach(async () => {
      // initial state = logged-in as 'Bob'
      Cookies.save(
        'lobbyState',
        {
          phase: 'list',
          playerName: 'Bob',
        },
        { path: '/' }
      );
      lobby = Enzyme.mount(
        <Lobby
          gameComponents={components}
          // stub for Client factory
          clientFactory={spyClient.mockReturnValue(NullComponent)}
        />
      );
    });

    afterEach(() => {
      spyClient.mockReset();
    });

    describe('creating a room', () => {
      beforeEach(async () => {
        lobby.instance().connection.rooms = [
          {
            gameID: 'gameID1',
            players: { '0': { id: 0 } },
            gameName: 'GameName1',
          },
        ];
        lobby.instance().forceUpdate();
        lobby.update();
      });

      test('room with default number of players', () => {
        lobby.instance().connection.create = spy;
        lobby
          .find('LobbyCreateRoomForm')
          .find('button')
          .simulate('click');
        expect(spy).toHaveBeenCalledWith('GameName1', 3);
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
      test('when server request fails', async () => {
        lobby.instance().connection.create = spy.mockImplementation(() => {
          throw new Error('fail');
        });
        await lobby
          .find('LobbyCreateRoomForm')
          .find('button')
          .simulate('click');
        expect(
          lobby
            .find('#instances')
            .find('.error-msg')
            .text()
        ).not.toBe('');
      });
      test('when game has no boundaries on the number of players', async () => {
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
        ).toBe('1234');
      });
      test('when game has boundaries on the number of players', async () => {
        expect(
          lobby
            .find('LobbyCreateRoomForm')
            .find('select')
            .at(1)
            .text()
        ).toBe('345');
      });
    });

    describe('joining a room', () => {
      beforeEach(async () => {
        lobby.instance().connection.rooms = [
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
        lobby.instance().connection.join = spy;
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
        lobby.instance().connection.join = spy.mockImplementation(() => {
          throw new Error('fail');
        });
        // join 1st room
        await lobby
          .find('LobbyRoomInstance')
          .first()
          .find('button')
          .simulate('click');
        expect(
          lobby
            .find('#instances')
            .find('.error-msg')
            .text()
        ).not.toBe('');
      });
    });

    describe('leaving a room', () => {
      beforeEach(async () => {
        lobby.instance().connection.rooms = [
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
        expect(
          lobby
            .find('LobbyRoomInstance')
            .find('button')
            .text()
        ).toBe('Leave');
      });
      test('shall leave a room', () => {
        // leave room
        lobby.instance().connection.leave = spy;
        lobby
          .find('LobbyRoomInstance')
          .find('button')
          .simulate('click');
        expect(spy).toHaveBeenCalledWith('GameName1', 'gameID1');
      });
      test('when server request fails', async () => {
        lobby.instance().connection.leave = spy.mockImplementation(() => {
          throw new Error('fail');
        });
        await lobby
          .find('LobbyRoomInstance')
          .find('button')
          .simulate('click');
        expect(
          lobby
            .find('#instances')
            .find('.error-msg')
            .text()
        ).not.toBe('');
      });
    });

    describe('starting a game', () => {
      beforeEach(async () => {
        lobby.instance().connection.rooms = [
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

          .first()
          .simulate('click');
        expect(lobby.instance().state.runningGame).toEqual({
          app: NullComponent,
          gameID: 'gameID1',
          playerID: '0',
          credentials: 'SECRET1',
        });
        expect(spyClient).toHaveBeenCalledWith({
          game: components[0].game,
          board: components[0].board,
          multiplayer: expect.anything(),
          debug: false,
        });
      });

      test('if player is spectator', () => {
        lobby
          .find('LobbyRoomInstance')
          .at(1)
          .find('button')
          .simulate('click');
        expect(lobby.instance().state.runningGame).toEqual({
          app: NullComponent,
          credentials: undefined,
          gameID: 'gameID2',
          playerID: '0',
        });
      });

      test('if game is not supported', () => {
        lobby
          .find('LobbyRoomInstance')
          .at(3)
          .find('button')
          .simulate('click');
        expect(spy).not.toHaveBeenCalled();
        expect(
          lobby
            .find('#instances')
            .find('.error-msg')
            .text()
        ).not.toBe('');
      });

      test('if game is monoplayer', () => {
        lobby
          .find('LobbyRoomInstance')
          .at(2)
          .find('button')

          .first()
          .simulate('click');
        expect(spy).not.toHaveBeenCalledWith(expect.anything(), {
          gameID: 'gameID3',
        });
      });
    });

    describe('exiting during game', () => {
      beforeEach(async () => {
        lobby.instance().connection.rooms = [
          {
            gameID: 'gameID1',
            players: {
              '0': { id: 0, name: 'Bob', credentials: 'SECRET1' },
              '1': { id: 1, name: 'Charly', credentials: 'SECRET2' },
            },
            gameName: 'GameName1',
          },
        ];
        lobby.instance().forceUpdate();
        lobby.update();
      });
      test('reset game', () => {
        lobby.instance().connection.playerCredentials = 'SECRET1';
        // start game
        lobby
          .find('LobbyRoomInstance')
          .first()
          .find('button')
          .first()
          .simulate('click');
        // exit game
        lobby
          .find('#game-exit')
          .find('button')
          .simulate('click');
        expect(lobby.instance().state.runningGame).toEqual(null);
        expect(lobby.instance().state.phase).toEqual('list');
      });
    });

    describe('custom renderer', () => {
      test('should render custom lobby ui', () => {
        const lobby = Enzyme.mount(
          <Lobby gameComponents={[]} renderer={() => <div>Foo</div>} />
        );

        expect(lobby.html()).toEqual('<div>Foo</div>');
      });

      test('should render custom lobby with games list', () => {
        const components = [
          { game: { name: 'GameName1' } },
          { game: { name: 'GameName2' } },
        ];
        const CustomLobbyUI = ({ gameComponents }) => (
          <div>
            {gameComponents
              .map(gameComponent => gameComponent.game.name)
              .join(',')}
          </div>
        );

        const lobby = Enzyme.mount(
          <Lobby
            gameComponents={components}
            renderer={({ gameComponents }) => (
              <CustomLobbyUI gameComponents={gameComponents} />
            )}
          />
        );

        expect(lobby.html()).toEqual('<div>GameName1,GameName2</div>');
      });

      test('should change lobby phase when click on custom enter button', () => {
        const CustomLobbyUI = ({ onEnterLobby }) => (
          <button onClick={() => onEnterLobby('Alex')}>Enter</button>
        );

        const lobby = Enzyme.mount(
          <Lobby
            gameComponents={[]}
            renderer={({ handleEnterLobby }) => (
              <CustomLobbyUI onEnterLobby={handleEnterLobby} />
            )}
          />
        );
        lobby.find('button').simulate('click');

        expect(lobby.instance().state.phase).toEqual('list');
        expect(lobby.instance().state.playerName).toEqual('Alex');
      });
    });
  });
});
