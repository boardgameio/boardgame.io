/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import request from 'supertest';
import Koa from 'koa';

import { createRouter, configureApp } from './api';
import { ProcessGameConfig } from '../core/game';
import * as StorageAPI from './db/base';
import { Game } from '../types';

jest.setTimeout(2000000000);

type StorageMocks = Record<
  'createGame' | 'setState' | 'fetch' | 'setMetadata' | 'listGames' | 'wipe',
  jest.Mock | ((...args: any[]) => any)
>;

class AsyncStorage extends StorageAPI.Async {
  public mocks: StorageMocks;

  constructor(args: Partial<StorageMocks> = {}) {
    super();
    this.mocks = {
      createGame: args.createGame || jest.fn(),
      setState: args.setState || jest.fn(),
      fetch: args.fetch || jest.fn(() => ({})),
      setMetadata: args.setMetadata || jest.fn(),
      listGames: args.listGames || jest.fn(() => []),
      wipe: args.wipe || jest.fn(),
    };
  }

  async connect() {}

  async createGame(...args) {
    this.mocks.createGame(...args);
  }

  async fetch(...args) {
    return this.mocks.fetch(...args);
  }

  async setState(...args) {
    this.mocks.setState(...args);
  }

  async setMetadata(...args) {
    this.mocks.setMetadata(...args);
  }

  async wipe(...args) {
    this.mocks.wipe(...args);
  }

  async listGames(...args) {
    return this.mocks.listGames(...args);
  }
}

describe('.createRouter', () => {
  function addApiToServer({
    app,
    ...args
  }: { app: Koa } & Parameters<typeof createRouter>[0]) {
    const router = createRouter(args);
    configureApp(app, router);
  }

  function createApiServer(args: Parameters<typeof createRouter>[0]) {
    const app = new Koa();
    addApiToServer({ app, ...args });
    return app;
  }

  describe('creating a game', () => {
    let response;
    let app: Koa;
    let db: AsyncStorage;
    let games: Game[];

    beforeEach(async () => {
      db = new AsyncStorage();
      games = [
        {
          name: 'foo',
          setup: (_, setupData) =>
            setupData
              ? {
                  colors: setupData.colors,
                }
              : {},
        },
      ];
    });

    describe('for an unprotected lobby server', () => {
      beforeEach(async () => {
        delete process.env.API_SECRET;

        const uuid = () => 'matchID';
        app = createApiServer({ db, games, uuid });

        response = await request(app.callback())
          .post('/games/foo/create')
          .send({ numPlayers: 3 });
      });

      test('is successful', () => {
        expect(response.status).toEqual(200);
      });

      test('creates game state and metadata', () => {
        expect(db.mocks.createGame).toHaveBeenCalledWith(
          'matchID',
          expect.objectContaining({
            initialState: expect.objectContaining({
              ctx: expect.objectContaining({
                numPlayers: 3,
              }),
            }),
            metadata: expect.objectContaining({
              gameName: 'foo',
              players: expect.objectContaining({
                '0': expect.objectContaining({}),
                '1': expect.objectContaining({}),
              }),
              unlisted: false,
            }),
          })
        );
      });

      test('returns match id', () => {
        expect(response.body.matchID).not.toBeNull();
      });

      describe('without numPlayers', () => {
        beforeEach(async () => {
          response = await request(app.callback()).post('/games/foo/create');
        });

        test('uses default numPlayers', () => {
          expect(db.mocks.createGame).toHaveBeenCalledWith(
            'matchID',
            expect.objectContaining({
              initialState: expect.objectContaining({
                ctx: expect.objectContaining({
                  numPlayers: 2,
                }),
              }),
            })
          );
        });
      });

      describe('for an unknown game name', () => {
        beforeEach(async () => {
          response = await request(app.callback()).post('/games/bar/create');
        });

        test('returns 404 error', () => {
          expect(response.status).toEqual(404);
        });
      });

      describe('with setupData', () => {
        beforeEach(async () => {
          response = await request(app.callback())
            .post('/games/foo/create')
            .send({
              setupData: {
                colors: {
                  '0': 'green',
                  '1': 'red',
                },
              },
            });
        });

        test('includes setupData in metadata', () => {
          expect(db.mocks.createGame).toHaveBeenCalledWith(
            'matchID',
            expect.objectContaining({
              metadata: expect.objectContaining({
                setupData: expect.objectContaining({
                  colors: expect.objectContaining({
                    '0': 'green',
                    '1': 'red',
                  }),
                }),
              }),
            })
          );
        });

        test('passes setupData to game setup function', () => {
          expect(db.mocks.createGame).toHaveBeenCalledWith(
            'matchID',
            expect.objectContaining({
              initialState: expect.objectContaining({
                G: expect.objectContaining({
                  colors: {
                    '0': 'green',
                    '1': 'red',
                  },
                }),
              }),
            })
          );
        });
      });

      describe('with unlisted option', () => {
        beforeEach(async () => {
          response = await request(app.callback())
            .post('/games/foo/create')
            .send({ unlisted: true });
        });

        test('sets unlisted in metadata', () => {
          expect(db.mocks.createGame).toHaveBeenCalledWith(
            'matchID',
            expect.objectContaining({
              metadata: expect.objectContaining({
                unlisted: true,
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

  describe('joining a room', () => {
    let response;
    let db: AsyncStorage;
    let games: Game[];
    let credentials: string;

    beforeEach(() => {
      credentials = 'SECRET';
      games = [ProcessGameConfig({ name: 'foo' })];
    });

    describe('for an unprotected lobby', () => {
      beforeEach(() => {
        delete process.env.API_SECRET;
      });

      describe('when the game does not exist', () => {
        beforeEach(async () => {
          db = new AsyncStorage({
            fetch: () => ({ metadata: null }),
          });
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
        beforeEach(async () => {
          db = new AsyncStorage({
            fetch: async () => {
              return {
                metadata: {
                  players: {
                    '0': {},
                  },
                },
              };
            },
          });
        });

        describe('when the playerID is available', () => {
          beforeEach(async () => {
            const app = createApiServer({
              db,
              games,
              uuid: () => 'matchID',
              generateCredentials: () => credentials,
            });
            response = await request(app.callback())
              .post('/games/foo/1/join')
              .send({ playerID: 0, playerName: 'alice' });
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
          });

          test('returns the player credentials', async () => {
            expect(response.body.playerCredentials).toEqual(credentials);
          });

          test('updates the player name', async () => {
            expect(db.mocks.setMetadata).toHaveBeenCalledWith(
              '1',
              expect.objectContaining({
                players: expect.objectContaining({
                  '0': expect.objectContaining({
                    name: 'alice',
                  }),
                }),
              })
            );
          });

          describe('when custom data is provided', () => {
            beforeEach(async () => {
              const app = createApiServer({ db, games });
              response = await request(app.callback())
                .post('/games/foo/1/join')
                .send({ playerID: 0, playerName: 'alice', data: 99 });
            });

            test('updates the player data', async () => {
              expect(db.mocks.setMetadata).toHaveBeenCalledWith(
                '1',
                expect.objectContaining({
                  players: expect.objectContaining({
                    '0': expect.objectContaining({
                      data: 99,
                    }),
                  }),
                })
              );
            });
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

        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/join')
              .send('playerName=1');
          });

          test('throws error 403', async () => {
            expect(response.status).toEqual(403);
          });
        });

        describe('when playerName is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/join')
              .send('playerID=1');
          });

          test('throws error 403', async () => {
            expect(response.status).toEqual(403);
          });
        });

        describe('when the playerID is not available', () => {
          beforeEach(async () => {
            db = new AsyncStorage({
              fetch: async () => {
                return {
                  metadata: {
                    players: {
                      '0': {
                        credentials,
                        name: 'bob',
                      },
                    },
                  },
                };
              },
            });

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

  describe('rename with deprecated endpoint', () => {
    let response;
    let db: AsyncStorage;
    let games: Game[];
    const warnMsg =
      'This endpoint /rename is deprecated. Please use /update instead.';

    beforeEach(() => {
      games = [ProcessGameConfig({ name: 'foo' })];
      console.warn = jest.fn();
    });

    describe('for an unprotected lobby', () => {
      beforeEach(() => {
        delete process.env.API_SECRET;
      });

      describe('when the game does not exist', () => {
        test('throws a "not found" error', async () => {
          db = new AsyncStorage({
            fetch: async () => ({ metadata: null }),
          });
          const app = createApiServer({ db, games });
          response = await request(app.callback())
            .post('/games/foo/1/rename')
            .send('playerID=0&playerName=alice&newName=ali');
          expect(response.status).toEqual(404);
          expect(console.warn).toBeCalledWith(warnMsg);
        });
      });

      describe('when the game does exist', () => {
        describe('when the playerID does exist', () => {
          beforeEach(async () => {
            db = new AsyncStorage({
              fetch: async () => {
                return {
                  metadata: {
                    players: {
                      '0': {
                        name: 'alice',
                        credentials: 'SECRET1',
                      },
                      '1': {
                        name: 'bob',
                        credentials: 'SECRET2',
                      },
                    },
                  },
                };
              },
            });
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/rename')
              .send('playerID=0&credentials=SECRET1&newName=ali');
          });

          describe('when the playerName is not a string', () => {
            test('throws newName must be a string', async () => {
              const app = createApiServer({ db, games });
              response = await request(app.callback())
                .post('/games/foo/1/rename')
                .send({ playerID: 0, credentials: 'SECRET1', newName: 2 });
              expect(response.text).toEqual(
                'newName must be a string, got number'
              );
              expect(console.warn).toBeCalledWith(warnMsg);
            });
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
            expect(console.warn).toBeCalledWith(warnMsg);
          });

          test('updates the players', async () => {
            expect(db.mocks.setMetadata).toHaveBeenCalledWith(
              '1',
              expect.objectContaining({
                players: expect.objectContaining({
                  '0': expect.objectContaining({
                    name: 'ali',
                  }),
                }),
              })
            );
            expect(console.warn).toBeCalledWith(warnMsg);
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/rename')
              .send('playerID=2&credentials=SECRET1&newName=joe');
            expect(response.status).toEqual(404);
            expect(console.warn).toBeCalledWith(warnMsg);
          });
        });

        describe('when the credentials are invalid', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/rename')
              .send('playerID=0&credentials=SECRET2&newName=mike');
            expect(response.status).toEqual(403);
            expect(console.warn).toBeCalledWith(warnMsg);
          });
        });

        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/rename')
              .send('credentials=foo&newName=bill');
          });

          test('throws error 403', async () => {
            expect(response.status).toEqual(403);
            expect(console.warn).toBeCalledWith(warnMsg);
          });
        });

        describe('when newName is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/rename')
              .send('credentials=foo&playerID=0');
          });

          test('throws error 403', async () => {
            expect(response.status).toEqual(403);
            expect(console.warn).toBeCalledWith(warnMsg);
          });
        });
      });
    });
  });

  describe('rename with update endpoint', () => {
    let response;
    let db: AsyncStorage;
    let games: Game[];

    beforeEach(() => {
      games = [ProcessGameConfig({ name: 'foo' })];
    });

    describe('for an unprotected lobby', () => {
      beforeEach(() => {
        delete process.env.API_SECRET;
      });

      describe('when the game does not exist', () => {
        test('throws game not found', async () => {
          db = new AsyncStorage({
            fetch: async () => ({ metadata: null }),
          });
          const app = createApiServer({ db, games });
          response = await request(app.callback())
            .post('/games/foo/1/update')
            .send('playerID=0&playerName=alice&newName=ali');
          expect(response.text).toEqual('Match 1 not found');
        });
      });

      describe('when the game does exist', () => {
        describe('when the playerID does exist', () => {
          beforeEach(async () => {
            db = new AsyncStorage({
              fetch: async () => {
                return {
                  metadata: {
                    players: {
                      '0': {
                        name: 'alice',
                        credentials: 'SECRET1',
                      },
                      '1': {
                        name: 'bob',
                        credentials: 'SECRET2',
                      },
                    },
                  },
                };
              },
            });
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send('playerID=0&credentials=SECRET1&newName=ali');
          });

          describe('when the playerName is not a string', () => {
            test('throws newName must be a string', async () => {
              const app = createApiServer({ db, games });
              response = await request(app.callback())
                .post('/games/foo/1/update')
                .send({ playerID: 0, credentials: 'SECRET1', newName: 2 });
              expect(response.text).toEqual(
                'newName must be a string, got number'
              );
            });
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
          });

          test('updates the players', async () => {
            expect(db.mocks.setMetadata).toHaveBeenCalledWith(
              '1',
              expect.objectContaining({
                players: expect.objectContaining({
                  '0': expect.objectContaining({
                    name: 'ali',
                  }),
                }),
              })
            );
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws player not found', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send('playerID=2&credentials=SECRET1&newName=joe');
            expect(response.text).toEqual('Player 2 not found');
          });
        });

        describe('when the credentials are invalid', () => {
          test('throws invalid credentials', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send('playerID=0&credentials=SECRET2&newName=mike');
            expect(response.text).toEqual('Invalid credentials SECRET2');
          });
        });

        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send('credentials=foo&newName=bill');
          });
          test('throws playerID is required', async () => {
            expect(response.text).toEqual('playerID is required');
          });
        });

        describe('when newName is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send('credentials=foo&playerID=0');
          });

          test('throws newName is required', async () => {
            expect(response.text).toEqual('newName or data is required');
          });
        });
      });
    });
  });

  describe('updating player metadata', () => {
    let response;
    let db: AsyncStorage;
    let games: Game[];

    beforeEach(() => {
      games = [ProcessGameConfig({ name: 'foo' })];
    });

    describe('for an unprotected lobby', () => {
      beforeEach(() => {
        delete process.env.API_SECRET;
      });
      describe('when the game does not exist', () => {
        test('throws game not found', async () => {
          db = new AsyncStorage({
            fetch: async () => ({ metadata: null }),
          });
          const app = createApiServer({ db, games });
          response = await request(app.callback())
            .post('/games/foo/1/update')
            .send({ playerID: 0, data: { subdata: 'text' } });
          expect(response.text).toEqual('Match 1 not found');
        });
      });

      describe('when the game does exist', () => {
        describe('when the playerID does exist', () => {
          beforeEach(async () => {
            db = new AsyncStorage({
              fetch: async () => {
                return {
                  metadata: {
                    players: {
                      '0': {
                        name: 'alice',
                        credentials: 'SECRET1',
                      },
                      '1': {
                        name: 'bob',
                        credentials: 'SECRET2',
                      },
                    },
                  },
                };
              },
            });
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send({
                playerID: 0,
                credentials: 'SECRET1',
                data: { subdata: 'text' },
              });
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
          });

          test('updates the players', async () => {
            expect(db.mocks.setMetadata).toHaveBeenCalledWith(
              '1',
              expect.objectContaining({
                players: expect.objectContaining({
                  '0': expect.objectContaining({
                    data: expect.objectContaining({
                      subdata: 'text',
                    }),
                  }),
                }),
              })
            );
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws playerID not found', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send({
                playerID: 2,
                credentials: 'SECRET1',
                data: { subdata: 'text' },
              });
            expect(response.text).toEqual('Player 2 not found');
          });
        });

        describe('when the credentials are invalid', () => {
          test('invalid credentials', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send({
                playerID: 0,
                credentials: 'SECRET2',
                data: { subdata: 'text' },
              });
            expect(response.text).toEqual('Invalid credentials SECRET2');
          });
        });

        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send({ credentials: 'foo', data: { subdata: 'text' } });
          });

          test('throws playerID is required', async () => {
            expect(response.text).toEqual('playerID is required');
          });
        });

        describe('when data is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/update')
              .send({ playerID: 0, credentials: 'foo' });
          });

          test('throws data is required', async () => {
            expect(response.text).toEqual('newName or data is required');
          });
        });
      });
    });
  });

  describe('leaving a room', () => {
    let response;
    let db: AsyncStorage;
    let games: Game[];

    beforeEach(() => {
      games = [ProcessGameConfig({ name: 'foo' })];
    });

    describe('for an unprotected lobby', () => {
      beforeEach(() => {
        delete process.env.API_SECRET;
      });

      describe('when the game does not exist', () => {
        test('throws a "not found" error', async () => {
          db = new AsyncStorage({
            fetch: async () => ({ metadata: null }),
          });
          const app = createApiServer({ db, games });
          response = await request(app.callback())
            .post('/games/foo/1/leave')
            .send('playerID=0&playerName=alice');
          expect(response.status).toEqual(404);
        });
      });

      describe('when the game does exist', () => {
        describe('when the playerID does exist', () => {
          beforeEach(async () => {
            db = new AsyncStorage({
              fetch: async () => {
                return {
                  metadata: {
                    players: {
                      '0': {
                        name: 'alice',
                        credentials: 'SECRET1',
                      },
                      '1': {
                        name: 'bob',
                        credentials: 'SECRET2',
                      },
                    },
                  },
                };
              },
            });
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/leave')
              .send('playerID=0&credentials=SECRET1');
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
          });

          test('updates the players', async () => {
            expect(db.mocks.setMetadata).toHaveBeenCalledWith(
              '1',
              expect.objectContaining({
                players: expect.objectContaining({
                  '0': expect.objectContaining({}),
                  '1': expect.objectContaining({
                    name: 'bob',
                    credentials: 'SECRET2',
                  }),
                }),
              })
            );
          });

          describe('when there are not players left', () => {
            test('removes the game', async () => {
              db = new AsyncStorage({
                fetch: async () => {
                  return {
                    metadata: {
                      players: {
                        '0': {
                          name: 'alice',
                          credentials: 'SECRET1',
                        },
                        '1': {
                          credentials: 'SECRET2',
                        },
                      },
                    },
                  };
                },
              });
              const app = createApiServer({ db, games });
              response = await request(app.callback())
                .post('/games/foo/1/leave')
                .send('playerID=0&credentials=SECRET1');
              expect(db.mocks.wipe).toHaveBeenCalledWith('1');
            });
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/leave')
              .send('playerID=2&credentials=SECRET1');
            expect(response.status).toEqual(404);
          });
        });

        describe('when the credentials are invalid', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/leave')
              .send('playerID=0&credentials=SECRET2');
            expect(response.status).toEqual(403);
          });
        });
        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, games });
            response = await request(app.callback())
              .post('/games/foo/1/leave')
              .send('credentials=foo');
          });

          test('throws error 403', async () => {
            expect(response.status).toEqual(403);
          });
        });
      });
    });
  });

  describe('requesting game list', () => {
    let db: AsyncStorage;
    beforeEach(() => {
      delete process.env.API_SECRET;
      db = new AsyncStorage();
    });

    describe('when given 2 games', () => {
      let response;
      beforeEach(async () => {
        let games = [ProcessGameConfig({ name: 'foo' }), { name: 'bar' }];
        let app = createApiServer({ db, games });

        response = await request(app.callback()).get('/games');
      });

      test('should get 2 games', async () => {
        expect(JSON.parse(response.text)).toEqual(['foo', 'bar']);
      });
    });
  });

  describe('play again', () => {
    let response;
    let db: AsyncStorage;
    let games: Game[];

    beforeEach(() => {
      games = [ProcessGameConfig({ name: 'foo' })];
      delete process.env.API_SECRET;
      db = new AsyncStorage({
        fetch: async () => {
          return {
            metadata: {
              players: {
                '0': {
                  name: 'alice',
                  credentials: 'SECRET1',
                },
                '1': {
                  name: 'bob',
                  credentials: 'SECRET2',
                },
              },
            },
          };
        },
      });
    });

    test('creates new game data', async () => {
      const uuid = () => 'newGameID';
      const app = createApiServer({ db, games, uuid });
      response = await request(app.callback())
        .post('/games/foo/1/playAgain')
        .send('playerID=0&credentials=SECRET1&numPlayers=4');
      expect(db.mocks.createGame).toHaveBeenCalledWith(
        'newGameID',
        expect.objectContaining({
          initialState: expect.objectContaining({
            ctx: expect.objectContaining({
              numPlayers: 4,
            }),
          }),
        })
      );
      expect(response.body.nextMatchID).toBe('newGameID');
    });

    test('fetches next id', async () => {
      db = new AsyncStorage({
        fetch: async () => {
          return {
            metadata: {
              players: {
                '0': {
                  name: 'alice',
                  credentials: 'SECRET1',
                },
                '1': {
                  name: 'bob',
                  credentials: 'SECRET2',
                },
              },
              nextMatchID: '12345',
            },
          };
        },
      });
      const app = createApiServer({ db, games });
      response = await request(app.callback())
        .post('/games/foo/1/playAgain')
        .send('playerID=0&credentials=SECRET1');
      expect(response.body.nextMatchID).toBe('12345');
    });

    test('when the match does not exist throws a "not found" error', async () => {
      db = new AsyncStorage({
        fetch: async () => ({ metadata: null }),
      });
      const app = createApiServer({ db, games });
      response = await request(app.callback())
        .post('/games/foo/1/playAgain')
        .send('playerID=0&playerName=alice');
      expect(response.status).toEqual(404);
    });

    test('when the playerID is undefnied throws error 403', async () => {
      const app = createApiServer({ db, games });
      response = await request(app.callback())
        .post('/games/foo/1/playAgain')
        .send('credentials=SECRET1');
      expect(response.status).toEqual(403);
    });

    test('when the playerID does not exist throws error 404', async () => {
      const app = createApiServer({ db, games });
      response = await request(app.callback())
        .post('/games/foo/1/playAgain')
        .send('playerID=2&credentials=SECRET1');
      expect(response.status).toEqual(404);
    });

    test('when the credentials are invalid throws error 404', async () => {
      const app = createApiServer({ db, games });
      response = await request(app.callback())
        .post('/games/foo/1/playAgain')
        .send('playerID=0&credentials=SECRET2');
      expect(response.status).toEqual(403);
    });

    test('when playerID is omitted throws error 403', async () => {
      const app = createApiServer({ db, games });
      response = await request(app.callback())
        .post('/games/foo/1/leave')
        .send('credentials=foo');
      expect(response.status).toEqual(403);
    });
  });

  describe('requesting room list', () => {
    let db: AsyncStorage;
    beforeEach(() => {
      delete process.env.API_SECRET;
      db = new AsyncStorage({
        fetch: async matchID => {
          return {
            metadata: {
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
              unlisted: matchID === 'bar-4',
              gameover: matchID === 'bar-3' ? { winner: 0 } : undefined,
            },
          };
        },
        listGames: async opts => {
          const metadata = {
            'foo-0': { gameName: 'foo' },
            'foo-1': { gameName: 'foo' },
            'bar-2': { gameName: 'bar' },
            'bar-3': { gameName: 'bar' },
            'bar-4': { gameName: 'bar' },
          };
          const keys = Object.keys(metadata);
          if (opts && opts.gameName) {
            return keys.filter(key => metadata[key].gameName === opts.gameName);
          }
          return [...keys];
        },
      });
    });

    describe('when given 2 matches', () => {
      let response;
      let matches;
      beforeEach(async () => {
        let games = [ProcessGameConfig({ name: 'foo' }), { name: 'bar' }];
        let app = createApiServer({ db, games });
        response = await request(app.callback()).get('/games/bar');
        matches = JSON.parse(response.text).matches;
      });

      test('returns matches for the selected game', async () => {
        expect(matches).toHaveLength(2);
      });

      test('returns match ids', async () => {
        expect(matches[0].matchID).toEqual('bar-2');
        expect(matches[1].matchID).toEqual('bar-3');
      });

      test('returns player names', async () => {
        expect(matches[0].players).toEqual([{ id: 0 }, { id: 1 }]);
        expect(matches[1].players).toEqual([{ id: 0 }, { id: 1 }]);
      });

      test('returns gameover data for ended match', async () => {
        expect(matches[0].gameover).toBeUndefined();
        expect(matches[1].gameover).toEqual({ winner: 0 });
      });
    });
  });

  describe('requesting room', () => {
    let db: AsyncStorage;
    beforeEach(() => {
      delete process.env.API_SECRET;
      db = new AsyncStorage({
        fetch: async () => {
          return {
            metadata: {
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
              gameover: { winner: 1 },
            },
          };
        },
        listGames: async () => {
          return ['bar:bar-0', 'foo:foo-0', 'bar:bar-1'];
        },
      });
    });

    describe('when given room ID', () => {
      let response;
      let room;
      beforeEach(async () => {
        let games = [ProcessGameConfig({ name: 'foo' }), { name: 'bar' }];
        let app = createApiServer({ db, games });
        response = await request(app.callback()).get('/games/bar/bar-0');
        room = JSON.parse(response.text);
      });

      test('returns game ids', async () => {
        expect(room.matchID).toEqual('bar-0');
      });

      test('returns player names', async () => {
        expect(room.players).toEqual([{ id: 0 }, { id: 1 }]);
      });

      test('returns gameover data for ended game', async () => {
        expect(room.gameover).toEqual({ winner: 1 });
      });
    });

    describe('when given a non-existent room ID', () => {
      let response;
      beforeEach(async () => {
        db = new AsyncStorage({
          fetch: async () => ({ metadata: null }),
        });
        let games = [ProcessGameConfig({ name: 'foo' })];
        let app = createApiServer({ db, games });
        response = await request(app.callback()).get('/games/bar/doesnotexist');
      });

      test('throws error 404', async () => {
        expect(response.status).toEqual(404);
      });
    });
  });

  describe('when server app is provided', () => {
    let db: AsyncStorage;
    let server;
    let useChain;
    let games: Game[];

    beforeEach(async () => {
      useChain = jest.fn(() => ({ use: useChain }));
      server = { use: useChain };
      db = new AsyncStorage();
      games = [
        {
          name: 'foo',
          setup: () => {},
        },
      ];
    });

    test('call .use method several times', async () => {
      addApiToServer({ app: server, db, games });
      expect(server.use.mock.calls.length).toBeGreaterThan(1);
    });

    test('call .use method several times with uuid', async () => {
      const uuid = () => 'foo';
      addApiToServer({ app: server, db, games, uuid });
      expect(server.use.mock.calls.length).toBeGreaterThan(1);
    });
  });
});
