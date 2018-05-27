/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import request from 'supertest';

import { isActionFromAuthenticPlayer, createApiServer } from './api-server';
import Game from '../core/game';

describe('.isActionFromAuthenticPlayer', () => {
  let action;
  let db;
  let gameID;
  let playerID;
  let gameMetadata;

  beforeEach(() => {
    gameID = 'some-game';
    playerID = '0';

    action = {
      payload: {
        credentials: 'SECRET',
      },
    };

    gameMetadata = {
      players: {
        '0': {
          credentials: 'SECRET',
        },
      },
    };

    db = {
      get() {
        return Promise.resolve(gameMetadata);
      },
    };
  });

  describe('when game metadata is not found', () => {
    beforeEach(() => {
      gameMetadata = null;
    });

    test('the action is authentic', async () => {
      const result = await isActionFromAuthenticPlayer({
        action,
        db,
        gameID,
        playerID,
      });

      expect(result).toBeTruthy();
    });
  });

  describe('when action contains no payload', () => {
    beforeEach(() => {
      action = {};
    });

    test('the action is authentic', async () => {
      const result = await isActionFromAuthenticPlayer({
        action,
        db,
        gameID,
        playerID,
      });

      expect(result).toBeTruthy();
    });
  });

  describe('when game has no credentials', () => {
    beforeEach(() => {
      gameMetadata = {
        players: {
          '0': {},
        },
      };
    });

    test('then action is authentic', async () => {
      const result = await isActionFromAuthenticPlayer({
        action,
        db,
        gameID,
        playerID,
      });

      expect(result).toBeTruthy();
    });
  });

  describe('when game has credentials', () => {
    describe('when action contains no credentials', () => {
      beforeEach(() => {
        action = {
          payload: {
            someStuff: 'foo',
          },
        };
      });

      test('then action is not authentic', async () => {
        const result = await isActionFromAuthenticPlayer({
          action,
          db,
          gameID,
          playerID,
        });

        expect(result).toBeFalsy();
      });
    });

    describe('when action credentials do not match game credentials', () => {
      beforeEach(() => {
        action = {
          payload: {
            credentials: 'WRONG',
          },
        };
      });
      test('then action is not authentic', async () => {
        const result = await isActionFromAuthenticPlayer({
          action,
          db,
          gameID,
          playerID,
        });

        expect(result).toBeFalsy();
      });
    });

    describe('when action credentials do match game credentials', () => {
      test('then action is authentic', async () => {
        const result = await isActionFromAuthenticPlayer({
          action,
          db,
          gameID,
          playerID,
        });

        expect(result).toBeTruthy();
      });
    });
  });
});

describe('.createApiServer', () => {
  describe('creating a game', () => {
    let response;
    let setSpy;
    let app;

    beforeEach(async () => {
      setSpy = jest.fn();
      const db = {
        set: async (id, state) => setSpy(id, state),
      };
      const games = [Game({ name: 'foo' })];

      app = createApiServer({ db, games });

      response = await request(app.callback())
        .post('/games/foo/create')
        .send('numPlayers=3');
    });

    test('is successful', () => {
      expect(response.status).toEqual(200);
    });

    test('creates game data', () => {
      expect(setSpy).toHaveBeenCalledWith(
        expect.stringMatching('foo:'),
        expect.objectContaining({
          ctx: expect.objectContaining({
            numPlayers: 3,
          }),
        })
      );
    });

    test('creates game metadata', () => {
      expect(setSpy).toHaveBeenCalledWith(
        expect.stringMatching(':metadata'),
        expect.objectContaining({
          players: expect.objectContaining({
            '0': expect.objectContaining({}),
            '1': expect.objectContaining({}),
          }),
        })
      );
    });

    test('returns game id', () => {
      expect(response.body.gameID).not.toBeNull();
    });

    describe('without numPlayers', () => {
      beforeEach(async () => {
        response = await request(app.callback()).post('/games/foo/create');
      });

      test('uses default numPlayers', () => {
        expect(setSpy).toHaveBeenCalledWith(
          expect.stringMatching('foo:'),
          expect.objectContaining({
            ctx: expect.objectContaining({
              numPlayers: 2,
            }),
          })
        );
      });
    });
  });

  describe('joining a game', () => {
    let response;
    let db;
    let games;
    let credentials;

    beforeEach(() => {
      credentials = 'SECRET';
      games = [Game({ name: 'foo' })];
    });

    describe('when the game does not exist', () => {
      beforeEach(async () => {
        db = {
          get: async () => null,
        };

        const app = createApiServer({ db, games });

        response = await request(app.callback())
          .patch('/game_instances/1/join')
          .send('gameName=foo&playerID=0&playerName=alice');
      });

      test('throws a "not found" error', async () => {
        expect(response.status).toEqual(404);
      });
    });

    describe('when the game does exist', () => {
      let setSpy;

      beforeEach(async () => {
        setSpy = jest.fn();
        db = {
          get: async () => {
            return {
              players: {
                '0': {
                  credentials,
                },
              },
            };
          },
          set: async (id, state) => setSpy(id, state),
        };

        const app = createApiServer({ db, games });

        response = await request(app.callback())
          .patch('/game_instances/1/join')
          .send('gameName=foo&playerID=0&playerName=alice');
      });

      test('is successful', async () => {
        expect(response.status).toEqual(200);
      });

      test('returns the player credentials', async () => {
        expect(response.body.playerCredentials).toEqual(credentials);
      });

      test('updates the player name', async () => {
        expect(setSpy).toHaveBeenCalledWith(
          expect.stringMatching(':metadata'),
          expect.objectContaining({
            players: expect.objectContaining({
              '0': expect.objectContaining({
                name: 'alice',
              }),
            }),
          })
        );
      });
    });
  });
});
