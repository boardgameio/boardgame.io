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

jest.setTimeout(2000000000);

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
      beforeEach(async () => {
        delete process.env.API_SECRET;

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

    describe('for a protected lobby', () => {
      beforeEach(() => {
        process.env.API_SECRET = 'protected';
        app = createApiServer({ db, games });
      });

      describe('without the lobby token', () => {
        beforeEach(async () => {
          response = await request(app.callback()).post('/games/foo/create');
        });

        test('fails', () => {
          expect(response.status).toEqual(403);
        });
      });

      describe('with the lobby token', () => {
        beforeEach(async () => {
          response = await request(app.callback())
            .post('/games/foo/create')
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
        });

        describe('when the playerID is available', () => {
          beforeEach(async () => {
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

        describe('when the playerID does not exist', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/join')
              .send('playerID=1&playerName=alice');
          });

          test('throws error 404', async () => {
            expect(response.status).toEqual(404);
          });
        });

        describe('when the playerID is not available', () => {
          beforeEach(async () => {
            setSpy = jest.fn();
            db = {
              get: async () => {
                return {
                  players: {
                    '0': {
                      credentials,
                      name: 'bob',
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
          test('throws error 409', async () => {
            expect(response.status).toEqual(409);
          });
        });
      });
    });
  });

  describe('leaving a game', () => {
    let response;
    let db;
    let games;

    beforeEach(() => {
      games = [Game({ name: 'foo' })];
    });

    describe('for an unprotected lobby', () => {
      beforeEach(() => {
        delete process.env.API_SECRET;
      });

      describe('when the game does not exist', () => {
        test('throws a "not found" error', async () => {
          db = {
            get: async () => null,
          };
          const app = createApiServer({ db, games });
          response = await request(app.callback())
            .post('/games/foo/1/leave')
            .send('playerID=0&playerName=alice');
          expect(response.status).toEqual(404);
        });
      });

      describe('when the game does exist', () => {
        describe('when the playerID does exist', () => {
          let setSpy;
          beforeEach(async () => {
            setSpy = jest.fn();
            db = {
              get: async () => {
                return {
                  players: {
                    '0': {
                      name: 'alice',
                      playerCredentials: 'SECRET1',
                    },
                    '1': {
                      name: 'bob',
                      playerCredentials: 'SECRET2',
                    },
                  },
                };
              },
              set: async (id, game) => setSpy(id, game),
            };
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/leave')
              .send('playerID=0&playerCredentials=SECRET1');
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
          });

          test('updates the players', async () => {
            expect(setSpy).toHaveBeenCalledWith(
              expect.stringMatching(':metadata'),
              expect.objectContaining({
                players: expect.objectContaining({
                  '0': expect.objectContaining({
                    playerCredentials: 'SECRET1',
                  }),
                  '1': expect.objectContaining({
                    name: 'bob',
                    playerCredentials: 'SECRET2',
                  }),
                }),
              })
            );
          });

          describe('when there are not players left', () => {
            test('removes the game', async () => {
              setSpy = jest.fn();
              db = {
                get: async () => {
                  return {
                    players: {
                      '0': {
                        name: 'alice',
                        playerCredentials: 'SECRET1',
                      },
                      '1': {
                        playerCredentials: 'SECRET2',
                      },
                    },
                  };
                },
                remove: async id => setSpy(id),
              };
              const app = createApiServer({ db, games });
              response = await request(app.callback())
                .post('/games/foo/1/leave')
                .send('playerID=0&playerCredentials=SECRET1');
              expect(setSpy).toHaveBeenCalledWith('1');
              expect(setSpy).toHaveBeenCalledWith(
                expect.stringMatching(':metadata')
              );
            });
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/leave')
              .send('playerID=2&playerCredentials=SECRET1');
            expect(response.status).toEqual(404);
          });
        });

        describe('when the credentials are invalid', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/leave')
              .send('playerID=0&playerCredentials=SECRET2');
            expect(response.status).toEqual(403);
          });
        });
      });
    });
  });

  describe('requesting game list', () => {
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

  describe('requesting game instances list', () => {
    let db;
    beforeEach(() => {
      delete process.env.API_SECRET;
      db = {
        get: async () => {
          return {
            players: {
              '0': {
                id: 0,
                credentials: 'SECRET1',
              },
              '1': {
                id: 1,
                credentials: 'SECRET2',
              },
            },
          };
        },
        set: async () => {},
        list: async () => {
          return [
            'bar:bar-0',
            'bar:bar-0:metadata',
            'foo:foo-0',
            'foo:foo-0:metadata',
            'bar:bar-1',
            'bar:bar-1:metadata',
          ];
        },
      };
    });
    describe('when given 2 games', async () => {
      let response;
      let instances;
      beforeEach(async () => {
        let games = [Game({ name: 'foo' }), Game({ name: 'bar' })];
        let app = createApiServer({ db, games });
        response = await request(app.callback()).get('/games/bar');
        instances = JSON.parse(response.text).gameInstances;
      });

      test('returns instances of the selected game', async () => {
        expect(instances).toHaveLength(2);
      });

      test('returns game ids', async () => {
        expect(instances[0].gameID).toEqual('bar-0');
        expect(instances[1].gameID).toEqual('bar-1');
      });

      test('returns player names', async () => {
        expect(instances[0].players).toEqual([{ id: 0 }, { id: 1 }]);
        expect(instances[1].players).toEqual([{ id: 0 }, { id: 1 }]);
      });
    });
  });
});
