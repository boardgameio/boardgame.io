/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { LobbyConnection } from './connection.js';

describe('lobby', () => {
  let lobby;
  let room1, room2;
  let jsonResult = [];
  let nextStatus = 200;

  beforeEach(async () => {
    room1 = { gameID: 'gameID_1', players: [{ id: '0' }] };
    room2 = { gameID: 'gameID_2', players: [{ id: '1' }] };
    // result of connection requests
    jsonResult = [
      () => ['game1', 'game2'],
      () => {
        return { rooms: [room1] };
      },
      () => {
        return { rooms: [room2] };
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
        playerName: 'Bob',
      });
      await lobby.refresh();
    });

    describe('get list of rooms', () => {
      test('when the server requests succeed', async () => {
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(lobby.rooms).toEqual([room1, room2]);
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        try {
          await lobby.refresh();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
        expect(lobby.rooms).toEqual([]);
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
        await lobby.join('game1', 'gameID_1', '0');
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(lobby.rooms[0].players[0]).toEqual({
          id: '0',
          name: 'Bob',
        });
        expect(lobby.playerCredentials).toEqual('SECRET');
      });
      test('when the room does not exist', async () => {
        try {
          await lobby.join('game1', 'gameID_3', '0');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
        expect(lobby.rooms).toEqual([room1, room2]);
      });
      test('when the seat is not available', async () => {
        room1.players[0].name = 'Bob';
        try {
          await lobby.join('game1', 'gameID_3', '0');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        try {
          await lobby.join('game1', 'gameID_1', '0');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('when the player has already joined another game', async () => {
        room2.players[0].name = 'Bob';
        try {
          await lobby.join('game1', 'gameID_1', '0');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    describe('leave a room', () => {
      beforeEach(async () => {
        // result of request 'join'
        jsonResult.push(() => {
          return { playerCredentials: 'SECRET' };
        });
        await lobby.join('game1', 'gameID_1', '0');
        // result of request 'leave'
        jsonResult.push(() => {
          return {};
        });
      });
      test('when the room exists', async () => {
        await lobby.leave('game1', 'gameID_1');
        expect(fetch).toHaveBeenCalledTimes(5);
        expect(lobby.rooms).toEqual([room1, room2]);
      });
      test('when the room does not exist', async () => {
        try {
          await lobby.leave('game1', 'gameID_3');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(lobby.rooms).toEqual([room1, room2]);
      });
      test('when the player is not in the room', async () => {
        await lobby.leave('game1', 'gameID_1');
        expect(fetch).toHaveBeenCalledTimes(5);
        try {
          await lobby.leave('game1', 'gameID_1');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        try {
          await lobby.leave('game1', 'gameID_1');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    describe('disconnect', () => {
      beforeEach(async () => {});
      test('when the player leaves the lobby', async () => {
        await lobby.disconnect();
        expect(lobby.rooms).toEqual([]);
      });
      test('when the player had joined a room', async () => {
        // result of request 'join'
        jsonResult.push(() => {
          return { playerCredentials: 'SECRET' };
        });
        await lobby.join('game1', 'gameID_1', '0');
        // result of request 'leave'
        jsonResult.push(() => {
          return {};
        });
        await lobby.disconnect();
        expect(lobby.rooms).toEqual([]);
      });
    });

    describe('create a room', () => {
      test('when the server request succeeds', async () => {
        await lobby.create('game1', 2);
        expect(fetch).toHaveBeenCalledTimes(4);
      });
      test('when the number of players is off boundaries', async () => {
        try {
          await lobby.create('game1', 1);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('when the number of players has no boundaries', async () => {
        await lobby.create('game2', 1);
      });
      test('when the game is unknown', async () => {
        try {
          await lobby.create('game3', 2);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        try {
          await lobby.create('game1', 2);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });
  });

  describe('handling some games', () => {
    beforeEach(async () => {
      lobby = new LobbyConnection({
        server: 'localhost',
        gameComponents: [{ board: 'Board1', game: { name: 'game1' } }],
      });
      await lobby.refresh();
    });
    test('get list of rooms for supported games', async () => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(lobby.rooms).toEqual([room1]);
    });
  });
});
