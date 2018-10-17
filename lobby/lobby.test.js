/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { LobbyConnection } from './lobby.js';

describe('lobby', () => {
  let lobby;
  let gameInstance1, gameInstance2;
  let jsonResult = [];
  let nextStatus = 200;

  beforeEach(async () => {
    gameInstance1 = { gameID: 'gameID_1', players: { '0': {} } };
    gameInstance2 = { gameID: 'gameID_2', players: { '0': {} } };
    // result of connection requests
    jsonResult = [
      () => ['game1', 'game2'],
      () => {
        return { gameInstances: [gameInstance1] };
      },
      () => {
        return { gameInstances: [gameInstance2] };
      },
    ];
    let nextResult = jsonResult.shift.bind(jsonResult);
    nextStatus = 200;
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: nextStatus,
        json: nextResult(),
      })
    );
  });

  describe('handling all games', () => {
    beforeEach(async () => {
      lobby = new LobbyConnection({
        server: 'localhost',
        gameComponents: [
          {
            board: 'Board1',
            game: { name: 'game1', minPlayers: 2, maxPlayers: 4 },
          },
          {
            board: 'Board2',
            game: { name: 'game2' },
          },
        ],
      });
      expect(await lobby.refresh()).toBe(true);
    });

    describe('get list of rooms', () => {
      test('when the server requests succeed', async () => {
        expect(lobby.errorMsg).toBe('');
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(lobby.gameInstances).toEqual([gameInstance1, gameInstance2]);
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        expect(await lobby.refresh()).toBe(false);
        expect(lobby.gameInstances).toEqual([]);
        expect(lobby.errorMsg).not.toBe('');
      });
    });

    describe('join a room', () => {
      beforeEach(async () => {
        // result of request 'join'
        jsonResult.push(() => {
          return { playerCredentials: 'SECRET' };
        });
      });
      test('when the room exists', async () => {
        expect(await lobby.join('game1', 'gameID_1', '0')).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(lobby.gameInstances[0].players['0']).toEqual({
          playerName: 'Visitor',
        });
        expect(lobby.playerCredentials).toEqual('SECRET');
        expect(lobby.errorMsg).toBe('');
      });
      test('when the room does not exist', async () => {
        expect(await lobby.join('game1', 'gameID_3', '0')).toBe(false);
        expect(lobby.gameInstances).toEqual([gameInstance1, gameInstance2]);
        expect(lobby.errorMsg).not.toBe('');
      });
      test('when the seat is not available', async () => {
        gameInstance1.players['0'].playerName = 'Bob';
        expect(await lobby.join('game1', 'gameID_1', '0')).toBe(false);
        expect(lobby.errorMsg).not.toBe('');
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        expect(await lobby.join('game1', 'gameID_1', '0')).toBe(false);
        expect(lobby.errorMsg).not.toBe('');
      });
    });

    describe('leave a room', () => {
      beforeEach(async () => {
        // result of request 'join'
        jsonResult.push(() => {
          return { playerCredentials: 'SECRET' };
        });
        expect(await lobby.join('game1', 'gameID_1', '0')).toBe(true);
        // result of request 'leave'
        jsonResult.push(() => {
          return {};
        });
      });
      test('when the room exists', async () => {
        expect(await lobby.leave('game1', 'gameID_1')).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(5);
        expect(lobby.gameInstances).toEqual([gameInstance1, gameInstance2]);
        expect(lobby.errorMsg).toBe('');
      });
      test('when the room does not exist', async () => {
        expect(await lobby.leave('game1', 'gameID_3')).toBe(false);
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(lobby.gameInstances).toEqual([gameInstance1, gameInstance2]);
        expect(lobby.errorMsg).not.toBe('');
      });
      test('when the player is not in the room', async () => {
        expect(await lobby.leave('game1', 'gameID_1')).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(5);
        expect(await lobby.leave('game1', 'gameID_1')).toBe(false);
        expect(lobby.errorMsg).not.toBe('');
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        expect(await lobby.leave('game1', 'gameID_1')).toBe(false);
        expect(lobby.errorMsg).not.toBe('');
      });
    });

    describe('create a room', () => {
      test('when the server request succeeds', async () => {
        expect(await lobby.create('game1', 2)).toBe(true);
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(lobby.errorMsg).toBe('');
      });
      test('when the number of players is off boundaries', async () => {
        expect(await lobby.create('game1', 1)).toBe(false);
        expect(lobby.errorMsg).not.toBe('');
      });
      test('when the number of players has no boundaries', async () => {
        expect(await lobby.create('game2', 1)).toBe(true);
        expect(lobby.errorMsg).toBe('');
      });
      test('when the game is unknown', async () => {
        expect(await lobby.create('game3', 2)).toBe(false);
        expect(lobby.errorMsg).not.toBe('');
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        expect(await lobby.create('game1', 2)).toBe(false);
        expect(lobby.errorMsg).not.toBe('');
      });
    });
  });

  describe('handling some games', () => {
    beforeEach(async () => {
      lobby = new LobbyConnection({
        server: 'localhost',
        gameComponents: [{ board: 'Board1', game: { name: 'game1' } }],
      });
      expect(await lobby.refresh()).toBe(true);
    });
    test('get list of rooms for supported games', async () => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(lobby.gameInstances).toEqual([gameInstance1]);
    });
  });
});
