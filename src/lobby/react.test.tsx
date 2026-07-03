/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import Cookies from 'react-cookies';
import Lobby from './react';
import { LobbyConnection } from './connection';

jest.mock('./connection');

/* mock server requests */
globalThis.fetch = jest
  .fn()
  .mockReturnValue({ ok: true, status: 200, json: () => [] }) as any;

/* mock 'Client' component */
function NullComponent() {
  return '<noscript />';
}

type MockConnection = {
  matches: any[];
  playerName: string;
  playerCredentials?: string;
  gameComponents: any[];
  refresh: jest.Mock;
  create: jest.Mock;
  join: jest.Mock;
  leave: jest.Mock;
  disconnect: jest.Mock;
  _getGameComponents: jest.Mock;
};

let mockConnection: MockConnection;

function makeMockConnection(components: any[]): MockConnection {
  return {
    matches: [],
    playerName: 'Visitor',
    playerCredentials: undefined,
    gameComponents: components,
    refresh: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    _getGameComponents: jest.fn((gameName: string) =>
      components.find((c) => c.game.name === gameName),
    ),
  };
}

describe('lobby', () => {
  const spy = jest.fn();
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;
  let components: any[];

  beforeEach(() => {
    setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
    clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
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
    mockConnection = makeMockConnection(components);
    (LobbyConnection as jest.Mock).mockImplementation(() => mockConnection);
  });

  afterEach(() => {
    spy.mockReset();
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  describe('specify servers', () => {
    test('gameServer', () => {
      const clientSpy = jest.fn();
      const ref = React.createRef<Lobby>();
      render(
        <Lobby
          ref={ref}
          gameComponents={components}
          clientFactory={clientSpy.mockReturnValue(NullComponent) as any}
          gameServer="localhost:9000"
        />,
      );
      act(() => {
        (ref.current as any)._startMatch('GameName1', { numPlayers: 2 });
      });
      expect(clientSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          multiplayer: expect.anything(),
        }),
      );
    });
  });

  describe('login/logout', () => {
    let ref: React.RefObject<Lobby>;
    let container: HTMLElement;
    let rerender: (ui: React.ReactElement) => void;

    beforeEach(() => {
      ref = React.createRef<Lobby>();
      const result = render(<Lobby ref={ref} gameComponents={components} />);
      container = result.container;
      rerender = result.rerender;
    });

    afterEach(() => {
      Cookies.remove('lobbyState', { path: '/' });
    });

    test('changing prop debug', () => {
      expect(() => {
        rerender(<Lobby ref={ref} gameComponents={components} debug={true} />);
      }).not.toThrow();
    });

    describe('login succeeds', () => {
      let input: HTMLInputElement;
      beforeEach(() => {
        input = container.querySelector(
          '.phase input[type="text"]',
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Mark' } });
      });
      test('by clicking', () => {
        const button = container.querySelector(
          '.phase button',
        ) as HTMLButtonElement;
        fireEvent.click(button);
        expect((ref.current as any).state.playerName).toBe('Mark');
      });
      test('by pressing enter', () => {
        fireEvent.keyDown(input, { key: 'Enter' });
        expect((ref.current as any).state.playerName).toBe('Mark');
      });
    });

    describe('login fails', () => {
      test('if no name entered', () => {
        const input = container.querySelector(
          '.phase input[type="text"]',
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });
        const button = container.querySelector(
          '.phase button',
        ) as HTMLButtonElement;
        fireEvent.click(button);
        const errorMsg = container.querySelector(
          '.phase .error-msg',
        ) as HTMLElement;
        expect(errorMsg.textContent).not.toBe('');
      });
      test('invalid key press', () => {
        const input = container.querySelector(
          '.phase input[type="text"]',
        ) as HTMLInputElement;
        const currentValue = input.value;
        fireEvent.keyDown(input, { key: 'Wololo' });
        expect(input.value).toBe(currentValue);
      });
    });

    describe('exiting lobby', () => {
      beforeEach(() => {
        mockConnection.matches = [
          {
            matchID: 'matchID1',
            players: {
              '0': { id: 0, name: 'Bob' },
              '1': { id: 1 },
            },
            gameName: 'GameName1',
          },
        ];
        act(() => {
          (ref.current as any).forceUpdate();
        });
      });
      test('disconnect from server', () => {
        mockConnection.disconnect = spy.mockResolvedValue(undefined);
        const exitButton = container.querySelector(
          '#lobby-exit button',
        ) as HTMLButtonElement;
        fireEvent.click(exitButton);
        expect(spy).toHaveBeenCalledWith();
      });
    });
  });

  describe('refresh during game', () => {
    let ref: React.RefObject<Lobby>;
    beforeEach(() => {
      // initial state = phase 'play'
      Cookies.save(
        'lobbyState',
        {
          phase: 'play',
          playerName: 'Bob',
        },
        { path: '/' },
      );
      ref = React.createRef<Lobby>();
      render(<Lobby ref={ref} gameComponents={components} />);
    });
    afterEach(() => {
      Cookies.remove('lobbyState', { path: '/' });
    });
    test('reset phase to list', () => {
      expect((ref.current as any).state.phase).toBe('list');
    });
  });

  describe('refresh interval triggering', () => {
    afterEach(() => {
      Cookies.remove('lobbyState', { path: '/' });
    });

    test('refresh does not start on initial component mount', () => {
      const ref = React.createRef<Lobby>();
      render(<Lobby ref={ref} gameComponents={components} />);

      expect(setIntervalSpy).not.toHaveBeenCalled();
    });

    test('refresh starts when transitioning from ENTER lobby to LIST lobby', () => {
      const ref = React.createRef<Lobby>();
      const { container } = render(
        <Lobby ref={ref} gameComponents={components} />,
      );

      const input = container.querySelector(
        '.phase input[type="text"]',
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Mark' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    test('refresh starts when component mounts and cookie state sends us to LIST', () => {
      Cookies.save(
        'lobbyState',
        {
          phase: 'list',
          playerName: 'Bob',
        },
        { path: '/' },
      );
      const ref = React.createRef<Lobby>();
      render(<Lobby ref={ref} gameComponents={components} />);

      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
    });

    test('refresh stops when transitioning from LIST to PLAY', () => {
      Cookies.save(
        'lobbyState',
        {
          phase: 'list',
          playerName: 'Bob',
        },
        { path: '/' },
      );
      const ref = React.createRef<Lobby>();
      render(<Lobby ref={ref} gameComponents={components} />);

      act(() => {
        (ref.current as any)._startMatch('GameName1', { numPlayers: 2 });
      });

      expect(clearIntervalSpy).toHaveBeenCalledWith(
        (ref.current as any)._currentInterval,
      );
    });
  });

  describe('refresh interval tracking', () => {
    let ref: React.RefObject<Lobby>;
    let rerender: (ui: React.ReactElement) => void;
    let unmount: () => void;

    beforeEach(() => {
      ref = React.createRef<Lobby>();
      const result = render(<Lobby ref={ref} gameComponents={components} />);
      rerender = result.rerender;
      unmount = result.unmount;
      const input = result.container.querySelector(
        '.phase input[type="text"]',
      ) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Mark' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    afterEach(() => {
      unmount();
      Cookies.remove('lobbyState', { path: '/' });
    });

    test('lobby stores an interval ID', () => {
      const { _currentInterval } = ref.current as any;
      expect(_currentInterval).toEqual(expect.any(Number));
    });

    test('updating interval prop, updates internal interval ID', () => {
      const { _currentInterval } = ref.current as any;
      rerender(
        <Lobby
          ref={ref}
          gameComponents={components}
          refreshInterval={10_000}
        />,
      );
      expect((ref.current as any)._currentInterval).not.toEqual(
        _currentInterval,
      );
    });

    test('updating other props does not update interval ID', () => {
      const { _currentInterval } = ref.current as any;
      rerender(<Lobby ref={ref} gameComponents={components} debug={true} />);
      expect((ref.current as any)._currentInterval).toEqual(_currentInterval);
    });
  });

  describe('matches list', () => {
    const spyClient = jest.fn();
    let ref: React.RefObject<Lobby>;
    let container: HTMLElement;

    function renderLobbyAlreadyLoggedIn() {
      ref = React.createRef<Lobby>();
      const result = render(
        <Lobby
          ref={ref}
          gameComponents={components}
          clientFactory={spyClient.mockReturnValue(NullComponent) as any}
        />,
      );
      container = result.container;
    }

    function forceLobbyUpdate() {
      act(() => {
        (ref.current as any).forceUpdate();
      });
    }

    function matchRows(): HTMLTableRowElement[] {
      return [
        ...container.querySelectorAll('#instances tbody tr'),
      ] as HTMLTableRowElement[];
    }

    beforeEach(() => {
      // initial state = logged-in as 'Bob'
      Cookies.save(
        'lobbyState',
        {
          phase: 'list',
          playerName: 'Bob',
        },
        { path: '/' },
      );
    });

    afterEach(() => {
      spyClient.mockReset();
      Cookies.remove('lobbyState', { path: '/' });
    });

    describe('creating a match', () => {
      beforeEach(() => {
        renderLobbyAlreadyLoggedIn();
        mockConnection.matches = [
          {
            matchID: 'matchID1',
            players: { '0': { id: 0 } },
            gameName: 'GameName1',
          },
        ];
        forceLobbyUpdate();
      });

      test('match with default number of players', () => {
        mockConnection.create = spy;
        const createButton = container.querySelector(
          '#match-creation button',
        ) as HTMLButtonElement;
        fireEvent.click(createButton);
        expect(spy).toHaveBeenCalledWith('GameName1', 3);
      });
      test('match with 2 players', () => {
        mockConnection.create = spy;
        const selects = container.querySelectorAll('#match-creation select');
        fireEvent.change(selects[0], { target: { value: '1' } });
        fireEvent.change(selects[1], { target: { value: '2' } });
        const createButton = container.querySelector(
          '#match-creation button',
        ) as HTMLButtonElement;
        fireEvent.click(createButton);
        expect(spy).toHaveBeenCalledWith('GameName2', 2);
      });
      test('when server request fails', async () => {
        mockConnection.create = spy.mockImplementation(() => {
          throw new Error('fail');
        });
        const createButton = container.querySelector(
          '#match-creation button',
        ) as HTMLButtonElement;
        await act(async () => {
          fireEvent.click(createButton);
        });
        const errorMsg = container.querySelector(
          '#instances .error-msg',
        ) as HTMLElement;
        expect(errorMsg.textContent).not.toBe('');
      });
      test('when game has no boundaries on the number of players', () => {
        // select 2nd game
        const selects = container.querySelectorAll('#match-creation select');
        fireEvent.change(selects[0], { target: { value: '1' } });
        const numSelect = container.querySelectorAll(
          '#match-creation select',
        )[1] as HTMLSelectElement;
        expect(numSelect.textContent).toBe('1234');
      });
      test('when game has boundaries on the number of players', () => {
        const numSelect = container.querySelectorAll(
          '#match-creation select',
        )[1] as HTMLSelectElement;
        expect(numSelect.textContent).toBe('345');
      });
    });

    describe('joining a match', () => {
      beforeEach(() => {
        renderLobbyAlreadyLoggedIn();
        mockConnection.matches = [
          {
            matchID: 'matchID1',
            players: { '0': { id: 0 } },
            gameName: 'GameName1',
          },
          {
            matchID: 'matchID2',
            players: { '0': { id: 0, name: 'Bob' } },
            gameName: 'GameName1',
          },
        ];
        forceLobbyUpdate();
      });
      test('when match is empty', () => {
        // join 1st match
        mockConnection.join = spy;
        const firstRow = matchRows()[0];
        const button = firstRow.querySelector('button') as HTMLButtonElement;
        fireEvent.click(button);
        expect(spy).toHaveBeenCalledWith('GameName1', 'matchID1', '0');
      });
      test('when match is full', () => {
        // try 2nd match
        const rows = matchRows();
        expect(rows[1].textContent).toContain('RUNNING');
      });
      test('when server request fails', async () => {
        mockConnection.join = spy.mockImplementation(() => {
          throw new Error('fail');
        });
        // join 1st match
        const firstRow = matchRows()[0];
        const button = firstRow.querySelector('button') as HTMLButtonElement;
        await act(async () => {
          fireEvent.click(button);
        });
        const errorMsg = container.querySelector(
          '#instances .error-msg',
        ) as HTMLElement;
        expect(errorMsg.textContent).not.toBe('');
      });
    });

    describe('leaving a match', () => {
      beforeEach(() => {
        renderLobbyAlreadyLoggedIn();
        mockConnection.matches = [
          {
            matchID: 'matchID1',
            players: {
              '0': { id: 0, name: 'Bob' },
              '1': { id: 1 },
            },
            gameName: 'GameName1',
          },
        ];
        forceLobbyUpdate();
      });
      test('shall leave a match', () => {
        // leave match
        mockConnection.leave = spy;
        const row = matchRows()[0];
        const button = row.querySelector('button') as HTMLButtonElement;
        fireEvent.click(button);
        expect(spy).toHaveBeenCalledWith('GameName1', 'matchID1');
      });
      test('when server request fails', async () => {
        mockConnection.leave = spy.mockImplementation(() => {
          throw new Error('fail');
        });
        const row = matchRows()[0];
        const button = row.querySelector('button') as HTMLButtonElement;
        await act(async () => {
          fireEvent.click(button);
        });
        const errorMsg = container.querySelector(
          '#instances .error-msg',
        ) as HTMLElement;
        expect(errorMsg.textContent).not.toBe('');
      });
    });

    describe('starting a game', () => {
      beforeEach(() => {
        renderLobbyAlreadyLoggedIn();
        mockConnection.matches = [
          {
            matchID: 'matchID1',
            players: {
              '0': { id: 0, name: 'Bob', credentials: 'SECRET1' },
              '1': { id: 1, name: 'Charly', credentials: 'SECRET2' },
            },
            gameName: 'GameName1',
          },
          {
            matchID: 'matchID2',
            players: { '0': { id: 0, name: 'Alice' } },
            gameName: 'GameName2',
          },
          {
            matchID: 'matchID3',
            players: { '0': { id: 0, name: 'Bob' } },
            gameName: 'GameName3',
          },
          {
            matchID: 'matchID4',
            players: { '0': { id: 0, name: 'Zoe' } },
            gameName: 'GameNameUnknown',
          },
        ];
        forceLobbyUpdate();
      });

      test('if player has joined the game', () => {
        mockConnection.playerCredentials = 'SECRET1';
        const firstRow = matchRows()[0];
        const buttons = firstRow.querySelectorAll('button');
        fireEvent.click(buttons[0]);
        expect((ref.current as any).state.runningMatch).toEqual({
          app: NullComponent,
          matchID: 'matchID1',
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
        const rows = matchRows();
        const button = rows[1].querySelector('button') as HTMLButtonElement;
        fireEvent.click(button);
        expect((ref.current as any).state.runningMatch).toEqual({
          app: NullComponent,
          credentials: undefined,
          matchID: 'matchID2',
          playerID: '0',
        });
      });

      test('if game is not supported', () => {
        const rows = matchRows();
        const button = rows[3].querySelector('button') as HTMLButtonElement;
        fireEvent.click(button);
        expect(spy).not.toHaveBeenCalled();
        const errorMsg = container.querySelector(
          '#instances .error-msg',
        ) as HTMLElement;
        expect(errorMsg.textContent).not.toBe('');
      });

      test('if game is monoplayer', () => {
        const rows = matchRows();
        const buttons = rows[2].querySelectorAll('button');
        fireEvent.click(buttons[0]);
        expect(spy).not.toHaveBeenCalledWith(expect.anything(), {
          matchID: 'matchID3',
        });
      });
    });

    describe('exiting during game', () => {
      beforeEach(() => {
        renderLobbyAlreadyLoggedIn();
        mockConnection.matches = [
          {
            matchID: 'matchID1',
            players: {
              '0': { id: 0, name: 'Bob', credentials: 'SECRET1' },
              '1': { id: 1, name: 'Charly', credentials: 'SECRET2' },
            },
            gameName: 'GameName1',
          },
        ];
        forceLobbyUpdate();
      });
      test('reset game', () => {
        mockConnection.playerCredentials = 'SECRET1';
        // start game
        const firstRow = matchRows()[0];
        const buttons = firstRow.querySelectorAll('button');
        fireEvent.click(buttons[0]);
        // exit game
        const exitButton = container.querySelector(
          '#match-exit button',
        ) as HTMLButtonElement;
        fireEvent.click(exitButton);
        expect((ref.current as any).state.runningMatch).toEqual(null);
        expect((ref.current as any).state.phase).toEqual('list');
      });
    });

    describe('custom renderer', () => {
      test('should render custom lobby ui', () => {
        const { container } = render(
          <Lobby gameComponents={[]} renderer={() => <div>Foo</div>} />,
        );

        expect(container.innerHTML).toEqual('<div>Foo</div>');
      });

      test('should render custom lobby with games list', () => {
        const customComponents: any[] = [
          { game: { name: 'GameName1' } },
          { game: { name: 'GameName2' } },
        ];
        const CustomLobbyUI = ({ gameComponents }: any) => (
          <div>
            {gameComponents
              .map((gameComponent: any) => gameComponent.game.name)
              .join(',')}
          </div>
        );

        const { container } = render(
          <Lobby
            gameComponents={customComponents}
            renderer={({ gameComponents }) => (
              <CustomLobbyUI gameComponents={gameComponents} />
            )}
          />,
        );

        expect(container.innerHTML).toEqual('<div>GameName1,GameName2</div>');
      });

      test('should change lobby phase when click on custom enter button', () => {
        const CustomLobbyUI = ({ onEnterLobby }: any) => (
          <button onClick={() => onEnterLobby('Alex')}>Enter</button>
        );

        const customRef = React.createRef<Lobby>();
        const { container } = render(
          <Lobby
            ref={customRef}
            gameComponents={[]}
            renderer={({ handleEnterLobby }) => (
              <CustomLobbyUI onEnterLobby={handleEnterLobby} />
            )}
          />,
        );
        const button = container.querySelector('button') as HTMLButtonElement;
        fireEvent.click(button);

        expect((customRef.current as any).state.phase).toEqual('list');
        expect((customRef.current as any).state.playerName).toEqual('Alex');
      });
    });
  });
});
