/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { LobbyConnection } from './connection';
import { LobbyAPI } from '../types';

describe('lobby', () => {
  let lobby: ReturnType<typeof LobbyConnection>;
  let match1: LobbyAPI.Match, match2: LobbyAPI.Match;
  let jsonResult = [];
  let nextStatus = 200;

  beforeEach(async () => {
    match1 = {
      gameName: 'game1',
      matchID: 'matchID_1',
      players: [{ id: 0 }],
      createdAt: 1,
      updatedAt: 4,
    };
    match2 = {
      gameName: 'game2',
      matchID: 'matchID_2',
      players: [{ id: 1 }],
      createdAt: 2,
      updatedAt: 3,
    };
    // result of connection requests
    jsonResult = [
      () => ['game1', 'game2'],
      () => {
        return { matches: [match1] };
      },
      () => {
        return { matches: [match2] };
      },
    ];
    let nextResult = jsonResult.shift.bind(jsonResult);
    nextStatus = 200;
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      status: nextStatus,
      json: nextResult(),
    }));
  });

  describe('handling all games', () => {
    beforeEach(async () => {
      lobby = LobbyConnection({
        server: 'localhost',
        gameComponents: [
          {
            board: () => null,
            game: { name: 'game1', minPlayers: 2, maxPlayers: 4 },
          },
          {
            board: () => null,
            game: { name: 'game2' },
          },
        ],
        playerName: 'Bob',
      });
      await lobby.refresh();
    });

    describe('get list of matches', () => {
      test('when the server requests succeed', async () => {
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(lobby.matches).toEqual([match1, match2]);
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        try {
          await lobby.refresh();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
        expect(lobby.matches).toEqual([]);
      });
    });

    describe('join a match', () => {
      beforeEach(async () => {
        // result of request 'join'
        jsonResult.push(() => {
          return { playerCredentials: 'SECRET' };
        });
      });
      test('when the match exists', async () => {
        await lobby.join('game1', 'matchID_1', '0');
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(lobby.matches[0].players[0]).toEqual({
          id: 0,
          name: 'Bob',
        });
        expect(lobby.playerCredentials).toEqual('SECRET');
      });
      test('when the match does not exist', async () => {
        try {
          await lobby.join('game1', 'matchID_3', '0');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
        expect(lobby.matches).toEqual([match1, match2]);
      });
      test('when the seat is not available', async () => {
        match1.players[0].name = 'Bob';
        try {
          await lobby.join('game1', 'matchID_3', '0');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        try {
          await lobby.join('game1', 'matchID_1', '0');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('when the player has already joined another match', async () => {
        match2.players[0].name = 'Bob';
        try {
          await lobby.join('game1', 'matchID_1', '0');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    describe('leave a match', () => {
      beforeEach(async () => {
        // result of request 'join'
        jsonResult.push(() => {
          return { playerCredentials: 'SECRET' };
        });
        await lobby.join('game1', 'matchID_1', '0');
        // result of request 'leave'
        jsonResult.push(() => {
          return {};
        });
      });
      test('when the match exists', async () => {
        await lobby.leave('game1', 'matchID_1');
        expect(fetch).toHaveBeenCalledTimes(5);
        expect(lobby.matches).toEqual([match1, match2]);
      });
      test('when the match does not exist', async () => {
        try {
          await lobby.leave('game1', 'matchID_3');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(lobby.matches).toEqual([match1, match2]);
      });
      test('when the player is not in the match', async () => {
        await lobby.leave('game1', 'matchID_1');
        expect(fetch).toHaveBeenCalledTimes(5);
        try {
          await lobby.leave('game1', 'matchID_1');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
      test('when the server request fails', async () => {
        nextStatus = 404;
        try {
          await lobby.leave('game1', 'matchID_1');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });
    });

    describe('disconnect', () => {
      beforeEach(async () => {});
      test('when the player leaves the lobby', async () => {
        await lobby.disconnect();
        expect(lobby.matches).toEqual([]);
      });
      test('when the player had joined a match', async () => {
        // result of request 'join'
        jsonResult.push(() => {
          return { playerCredentials: 'SECRET' };
        });
        await lobby.join('game1', 'matchID_1', '0');
        // result of request 'leave'
        jsonResult.push(() => {
          return {};
        });
        await lobby.disconnect();
        expect(lobby.matches).toEqual([]);
      });
    });

    describe('create a match', () => {
      test('when the server request succeeds', async () => {
        jsonResult.push(() => ({ matchID: 'abc' }));
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
        jsonResult.push(() => ({ matchID: 'def' }));
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
      lobby = LobbyConnection({
        server: 'localhost',
        gameComponents: [{ board: () => null, game: { name: 'game1' } }],
      });
      await lobby.refresh();
    });
    test('get list of matches for supported games', async () => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(lobby.matches).toEqual([match1]);
    });
  });
});
