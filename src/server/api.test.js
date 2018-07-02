/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import request from 'supertest';

import { isActionFromAuthenticPlayer, createApiServer } from './api';
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
    let db;
    let games;

    beforeEach(async () => {
      setSpy = jest.fn();
      db = {
        set: async (id, state) => setSpy(id, state),
      };
      games = [Game({ name: 'foo' })];
    });

    describe('for an unprotected lobby server', () => {
      beforeEach(async done => {
        delete process.env.API_SECRET;

        app = createApiServer({ db, games });

        response = await request(app.callback())
          .post('/games/foo')
          .send('numPlayers=3');

        done();
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
          response = await request(app.callback()).post('/games/foo');
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

    describe('for a protected lobby', () => {
      beforeEach(() => {
        process.env.API_SECRET = 'protected';
        app = createApiServer({ db, games });
      });

      describe('without the lobby token', () => {
        beforeEach(async () => {
          response = await request(app.callback()).post('/games/foo');
        });

        test('fails', () => {
          expect(response.status).toEqual(403);
        });
      });

      describe('with the lobby token', () => {
        beforeEach(async () => {
          response = await request(app.callback())
            .post('/games/foo')
            .set('API-Secret', 'protected');
        });

        test('succeeds', () => {
          expect(response.status).toEqual(200);
        });
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

    describe('for an unprotected lobby', () => {
      beforeEach(() => {
        delete process.env.API_SECRET;
      });

      describe('when the game does not exist', () => {
        beforeEach(async () => {
          db = {
            get: async () => null,
          };

          const app = createApiServer({ db, games });

          response = await request(app.callback())
            .post('/games/foo/1/join')
            .send('playerID=0&playerName=alice');
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
            .post('/games/foo/1/join')
            .send('playerID=0&playerName=alice');
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

    describe('for an protected lobby', () => {
      beforeEach(() => {
        process.env.API_SECRET = 'protected';
      });

      describe('without the lobby token', () => {
        beforeEach(async () => {
          const app = createApiServer({ db, games });

          response = await request(app.callback())
            .post('/games/foo/1/join')
            .send('playerID=0&playerName=alice');
        });

        test('fails', () => {
          expect(response.status).toEqual(403);
        });
      });

      describe('with the lobby token', () => {
        beforeEach(async () => {
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
            set: async () => {},
          };

          const app = createApiServer({ db, games });

          response = await request(app.callback())
            .post('/games/foo/1/join')
            .set('API-Secret', 'protected')
            .send('playerID=0&playerName=alice');
        });

        test('succeeds', () => {
          expect(response.status).toEqual(200);
        });
      });
    });
  });

  describe('gets game list', () => {
    let db;
    beforeEach(() => {
      delete process.env.API_SECRET;
      db = {
        get: async () => {},
        set: async () => {},
      };
    });

    describe('when given 2 games', async () => {
      let response;
      beforeEach(async () => {
        let app;
        let games;
        games = [Game({ name: 'foo' }), Game({ name: 'bar' })];
        app = createApiServer({ db, games });

        response = await request(app.callback()).get('/games');
      });

      test('should get 2 games', async () => {
        expect(JSON.parse(response.text)).toEqual(['foo', 'bar']);
      });
    });
  });
});
