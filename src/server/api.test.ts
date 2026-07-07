/**
 * @jest-environment node
 */

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import request from 'supertest';
import Koa from 'koa';
import Router from '@koa/router';
import * as dateMock from 'jest-date-mock';

import { configureRouter, configureApp } from './api';
import { ProcessGameConfig } from '../core/game';
import { InitializeGame } from '../core/initialize';
import { Auth } from './auth';
import * as StorageAPI from './db/base';
import { InMemory } from './db/inmemory';
import { Origins } from './cors';
import type { Game, Server } from '../types';

jest.setTimeout(2_000_000_000);

beforeEach(() => {
  dateMock.clear();
});

type StorageMocks = Record<
  'createMatch' | 'setState' | 'fetch' | 'setMetadata' | 'listMatches' | 'wipe',
  jest.Mock | ((...args: any[]) => any)
>;

class AsyncStorage extends StorageAPI.Async {
  public mocks: StorageMocks;

  constructor(args: Partial<StorageMocks> = {}) {
    super();
    this.mocks = {
      createMatch: args.createMatch || jest.fn(),
      setState: args.setState || jest.fn(),
      fetch: args.fetch || jest.fn(() => ({})),
      setMetadata: args.setMetadata || jest.fn(),
      listMatches: args.listMatches || jest.fn(() => []),
      wipe: args.wipe || jest.fn(),
    };
  }

  async connect() {}

  async createMatch(...args) {
    this.mocks.createMatch(...args);
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

  async listMatches(...args) {
    return this.mocks.listMatches(...args);
  }
}

describe('.configureRouter', () => {
  function addApiToServer({
    app,
    origins,
    ...args
  }: {
    app: Server.App;
    origins?: Parameters<typeof configureApp>[2];
  } & Omit<Parameters<typeof configureRouter>[0], 'router'>) {
    const router = new Router<any, Server.AppCtx>();
    configureRouter({ router, ...args });
    configureApp(app, router, origins);
  }

  function createApiServer(
    args: Omit<Parameters<typeof addApiToServer>[0], 'app'>,
  ) {
    const app: Server.App = new Koa();
    addApiToServer({ app, ...args });
    return app;
  }

  function apiCall(app: Koa) {
    const agent = request(app.callback());
    return {
      get: (path: string) => agent.get(path).set('Connection', 'close'),
      post: (path: string) => agent.post(path).set('Connection', 'close'),
    };
  }

  describe('creating a game', () => {
    let response;
    let app: Koa;
    let db: AsyncStorage;
    const auth = new Auth();
    let games: Game[];
    const updatedAt = new Date(2020, 3, 4, 5, 6, 7);

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
        {
          name: 'validate',
          setup: (_, setupData) =>
            setupData
              ? {
                  numTokens: setupData.tokens,
                }
              : {},
          validateSetupData: (setupData, numPlayers) =>
            numPlayers == 2 && setupData.tokens !== 2
              ? 'Two player games must use two tokens'
              : undefined,
          minPlayers: 2,
          maxPlayers: 2,
        },
      ];
    });

    describe('for an unprotected lobby server', () => {
      beforeEach(async () => {
        dateMock.advanceTo(updatedAt);

        delete process.env.API_SECRET;

        const uuid = () => 'matchID';
        app = createApiServer({ db, auth, games, uuid });

        response = await apiCall(app)
          .post('/games/foo/create')
          .send({ numPlayers: 3 });
      });

      test('is successful', () => {
        expect(response.status).toEqual(200);
      });

      test('creates game state and metadata', () => {
        expect(db.mocks.createMatch).toHaveBeenCalledWith(
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
              createdAt: updatedAt.getTime(),
              updatedAt: updatedAt.getTime(),
            }),
          }),
        );
      });

      test('returns match id', () => {
        expect(response.body.matchID).not.toBeNull();
      });

      describe('without numPlayers', () => {
        beforeEach(async () => {
          response = await apiCall(app).post('/games/foo/create');
        });

        test('uses default numPlayers', () => {
          expect(db.mocks.createMatch).toHaveBeenCalledWith(
            'matchID',
            expect.objectContaining({
              initialState: expect.objectContaining({
                ctx: expect.objectContaining({
                  numPlayers: 2,
                }),
              }),
            }),
          );
        });
      });

      describe('with invalid numPlayers', () => {
        test('not enough players fails', async () => {
          response = await apiCall(app)
            .post('/games/validate/create')
            .send({ numPlayers: 1 });

          expect(response.status).toEqual(400);
        });

        test('too many players fails', async () => {
          response = await apiCall(app)
            .post('/games/validate/create')
            .send({ numPlayers: 3 });

          expect(response.status).toEqual(400);
        });

        test('invalid type fails', async () => {
          response = await apiCall(app)
            .post('/games/validate/create')
            .send({ numPlayers: 'hello' });

          expect(response.status).toEqual(400);
        });
      });

      describe('for an unknown game name', () => {
        beforeEach(async () => {
          response = await apiCall(app).post('/games/bar/create');
        });

        test('returns 404 error', () => {
          expect(response.status).toEqual(404);
        });
      });

      describe('with setupData', () => {
        beforeEach(async () => {
          response = await apiCall(app)
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
          expect(db.mocks.createMatch).toHaveBeenCalledWith(
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
            }),
          );
        });

        test('passes setupData to game setup function', () => {
          expect(db.mocks.createMatch).toHaveBeenCalledWith(
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
            }),
          );
        });
      });

      describe('with large setupData (>1MB, <5MB)', () => {
        beforeEach(async () => {
          // Create a ~1.5MB string to exceed the default 1MB jsonLimit
          const largeData = 'x'.repeat(1.5 * 1024 * 1024);
          response = await apiCall(app)
            .post('/games/foo/create')
            .send({ setupData: { payload: largeData } });
        });

        test('is successful', () => {
          expect(response.status).toEqual(200);
        });

        test('preserves large setupData in metadata', () => {
          expect(db.mocks.createMatch).toHaveBeenCalledWith(
            'matchID',
            expect.objectContaining({
              metadata: expect.objectContaining({
                setupData: expect.objectContaining({
                  payload: expect.stringMatching(/^x+$/),
                }),
              }),
            }),
          );
        });
      });

      describe('with setupData validation', () => {
        test('creates game if validation passes', async () => {
          response = await apiCall(app)
            .post('/games/validate/create')
            .send({
              numPlayers: 2,
              setupData: {
                tokens: 2,
              },
            });

          expect(response.status).toEqual(200);
        });

        test('returns error if validation fails', async () => {
          response = await apiCall(app)
            .post('/games/validate/create')
            .send({
              numPlayers: 2,
              setupData: {
                tokens: 3,
              },
            });

          expect(response.status).toEqual(400);
        });
      });

      describe('with unlisted option', () => {
        beforeEach(async () => {
          response = await apiCall(app)
            .post('/games/foo/create')
            .send({ unlisted: true });
        });

        test('sets unlisted in metadata', () => {
          expect(db.mocks.createMatch).toHaveBeenCalledWith(
            'matchID',
            expect.objectContaining({
              metadata: expect.objectContaining({
                unlisted: true,
              }),
            }),
          );
        });
      });
    });

    describe('for a protected lobby', () => {
      beforeEach(() => {
        process.env.API_SECRET = 'protected';
        app = createApiServer({ db, auth, games });
      });

      describe('without the lobby token', () => {
        beforeEach(async () => {
          response = await apiCall(app).post('/games/foo/create');
        });

        test('fails', () => {
          expect(response.status).toEqual(403);
        });
      });

      describe('with the lobby token', () => {
        beforeEach(async () => {
          response = await apiCall(app)
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
    const auth = new Auth();
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
          const app = createApiServer({ db, auth, games });

          response = await apiCall(app)
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
              auth: new Auth({ generateCredentials: () => credentials }),
              games,
              uuid: () => 'matchID',
            });
            response = await apiCall(app)
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
              }),
            );
          });

          describe('when custom data is provided', () => {
            beforeEach(async () => {
              const app = createApiServer({ db, auth, games });
              response = await apiCall(app)
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
                }),
              );
            });
          });
        });

        describe('when the playerID does not exist', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/join')
              .send('playerID=1&playerName=alice');
          });

          test('throws error 404', async () => {
            expect(response.status).toEqual(404);
          });
        });

        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({
              db,
              auth: new Auth({ generateCredentials: () => credentials }),
              games,
              uuid: () => 'matchID',
            });
            response = await apiCall(app)
              .post('/games/foo/1/join')
              .send('playerName=alice');
          });

          describe('numPlayers is reached in match', () => {
            beforeEach(async () => {
              db = new AsyncStorage({
                fetch: async () => {
                  return {
                    metadata: {
                      players: {
                        '0': { name: 'alice' },
                      },
                    },
                  };
                },
              });
              const app = createApiServer({ db, auth, games });
              response = await apiCall(app)
                .post('/games/foo/1/join')
                .send('playerName=bob');
            });

            test('throws error 409', async () => {
              expect(response.status).toEqual(409);
            });
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
          });

          test('returns the player credentials', async () => {
            expect(response.body.playerCredentials).toEqual(credentials);
          });

          test('returns the playerID', async () => {
            expect(response.body.playerID).toEqual('0');
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
              }),
            );
          });
        });

        describe('when playerName is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
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

            const app = createApiServer({ db, auth, games });

            response = await apiCall(app)
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
    const auth = new Auth();
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
          const app = createApiServer({ db, auth, games });
          response = await apiCall(app)
            .post('/games/foo/1/rename')
            .send('playerID=0&playerName=alice&newName=ali');
          expect(response.status).toEqual(404);
          expect(console.warn).toHaveBeenCalledWith(warnMsg);
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
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/rename')
              .send('playerID=0&credentials=SECRET1&newName=ali');
          });

          describe('when the playerName is not a string', () => {
            test('throws newName must be a string', async () => {
              const app = createApiServer({ db, auth, games });
              response = await apiCall(app)
                .post('/games/foo/1/rename')
                .send({ playerID: 0, credentials: 'SECRET1', newName: 2 });
              expect(response.text).toEqual(
                'newName must be a string, got number',
              );
              expect(console.warn).toHaveBeenCalledWith(warnMsg);
            });
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
            expect(console.warn).toHaveBeenCalledWith(warnMsg);
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
              }),
            );
            expect(console.warn).toHaveBeenCalledWith(warnMsg);
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/rename')
              .send('playerID=2&credentials=SECRET1&newName=joe');
            expect(response.status).toEqual(404);
            expect(console.warn).toHaveBeenCalledWith(warnMsg);
          });
        });

        describe('when the credentials are invalid', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/rename')
              .send('playerID=0&credentials=SECRET2&newName=mike');
            expect(response.status).toEqual(403);
            expect(console.warn).toHaveBeenCalledWith(warnMsg);
          });
        });

        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/rename')
              .send('credentials=foo&newName=bill');
          });

          test('throws error 403', async () => {
            expect(response.status).toEqual(403);
            expect(console.warn).toHaveBeenCalledWith(warnMsg);
          });
        });

        describe('when newName is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/rename')
              .send('credentials=foo&playerID=0');
          });

          test('throws error 403', async () => {
            expect(response.status).toEqual(403);
            expect(console.warn).toHaveBeenCalledWith(warnMsg);
          });
        });
      });
    });
  });

  describe('rename with update endpoint', () => {
    let response;
    let db: AsyncStorage;
    const auth = new Auth();
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
          const app = createApiServer({ db, auth, games });
          response = await apiCall(app)
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
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/update')
              .send('playerID=0&credentials=SECRET1&newName=ali');
          });

          describe('when the playerName is not a string', () => {
            test('throws newName must be a string', async () => {
              const app = createApiServer({ db, auth, games });
              response = await apiCall(app)
                .post('/games/foo/1/update')
                .send({ playerID: 0, credentials: 'SECRET1', newName: 2 });
              expect(response.text).toEqual(
                'newName must be a string, got number',
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
              }),
            );
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws player not found', async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/update')
              .send('playerID=2&credentials=SECRET1&newName=joe');
            expect(response.text).toEqual('Player 2 not found');
          });
        });

        describe('when the credentials are invalid', () => {
          test('throws invalid credentials', async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/update')
              .send('playerID=0&credentials=SECRET2&newName=mike');
            expect(response.text).toEqual('Invalid credentials SECRET2');
          });
        });

        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/update')
              .send('credentials=foo&newName=bill');
          });
          test('throws playerID is required', async () => {
            expect(response.text).toEqual('playerID is required');
          });
        });

        describe('when newName is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
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
    const auth = new Auth();
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
          const app = createApiServer({ db, auth, games });
          response = await apiCall(app)
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
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
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
              }),
            );
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws playerID not found', async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
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
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
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
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/update')
              .send({ credentials: 'foo', data: { subdata: 'text' } });
          });

          test('throws playerID is required', async () => {
            expect(response.text).toEqual('playerID is required');
          });
        });

        describe('when data is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
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
    const auth = new Auth();
    let games: Game[];
    const warnMsg =
      'This endpoint /leave is deprecated. Please use /leaveSlot instead.';
    const createLeaveMetadata = (
      gameName = 'foo',
      players?: Server.MatchData['players'],
    ): Server.MatchData => {
      players = players || {
        '0': { id: 0, name: 'alice', credentials: 'SECRET1' },
        '1': { id: 1, name: 'bob', credentials: 'SECRET2' },
      };

      return {
        gameName,
        players,
        createdAt: 0,
        updatedAt: 0,
      };
    };

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
          const app = createApiServer({ db, auth, games });
          response = await apiCall(app)
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
                    gameName: 'foo',
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
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/leave')
              .send('playerID=0&credentials=SECRET1');
          });

          test('is successful', async () => {
            expect(response.status).toEqual(200);
          });

          test('warns that /leave is deprecated', async () => {
            expect(console.warn).toHaveBeenCalledWith(warnMsg);
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
              }),
            );
          });

          describe('when there are not players left', () => {
            test('removes the game', async () => {
              db = new AsyncStorage({
                fetch: async () => {
                  return {
                    metadata: {
                      gameName: 'foo',
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
              const app = createApiServer({ db, auth, games });
              response = await apiCall(app)
                .post('/games/foo/1/leave')
                .send('playerID=0&credentials=SECRET1');
              expect(db.mocks.wipe).toHaveBeenCalledWith('1');
            });
          });
        });

        describe('when the playerID does not exist', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/leave')
              .send('playerID=2&credentials=SECRET1');
            expect(response.status).toEqual(404);
          });
        });

        describe('when the credentials are invalid', () => {
          test('throws error 404', async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/leave')
              .send('playerID=0&credentials=SECRET2');
            expect(response.status).toEqual(403);
          });
        });
        describe('when playerID is omitted', () => {
          beforeEach(async () => {
            const app = createApiServer({ db, auth, games });
            response = await apiCall(app)
              .post('/games/foo/1/leave')
              .send('credentials=foo');
          });

          test('throws error 403', async () => {
            expect(response.status).toEqual(403);
          });
        });

        test.each(['/leave', '/leaveSlot', '/leaveGame'])(
          'rejects non-string playerID for %s',
          async (endpoint) => {
            const app = createApiServer({
              db: new AsyncStorage(),
              auth,
              games,
            });
            response = await apiCall(app)
              .post(`/games/foo/1${endpoint}`)
              .send({ playerID: 0, credentials: 'SECRET1' });

            expect(response.status).toEqual(403);
            expect(response.text).toEqual(
              'playerID must be a string, got number',
            );
          },
        );

        test.each(['/leave', '/leaveSlot', '/leaveGame'])(
          'rejects non-string credentials for %s',
          async (endpoint) => {
            const app = createApiServer({
              db: new AsyncStorage(),
              auth,
              games,
            });
            response = await apiCall(app)
              .post(`/games/foo/1${endpoint}`)
              .send({ playerID: '0', credentials: 1 });

            expect(response.status).toEqual(403);
            expect(response.text).toEqual(
              'credentials must be a string, got number',
            );
          },
        );

        test.each(['/leave', '/leaveSlot', '/leaveGame'])(
          'checks game name before player lookup for %s',
          async (endpoint) => {
            db = new AsyncStorage({
              fetch: async () => ({ metadata: createLeaveMetadata('bar') }),
            });
            const app = createApiServer({ db, auth, games });

            response = await apiCall(app)
              .post(`/games/foo/1${endpoint}`)
              .send('playerID=9&credentials=SECRET1');

            expect(response.status).toEqual(404);
            expect(response.text).toEqual('Match 1 not found');
            expect(db.mocks.setMetadata).not.toHaveBeenCalled();
            expect(db.mocks.wipe).not.toHaveBeenCalled();
          },
        );

        test('leaveSlot clears the lobby slot', async () => {
          db = new AsyncStorage({
            fetch: async () => ({ metadata: createLeaveMetadata() }),
          });
          const app = createApiServer({ db, auth, games });

          response = await apiCall(app)
            .post('/games/foo/1/leaveSlot')
            .send('playerID=0&credentials=SECRET1');

          expect(response.status).toEqual(200);
          expect(db.mocks.setMetadata).toHaveBeenCalledWith(
            '1',
            expect.objectContaining({
              players: expect.objectContaining({
                '0': { id: 0 },
                '1': expect.objectContaining({
                  name: 'bob',
                  credentials: 'SECRET2',
                }),
              }),
            }),
          );
        });
      });
    });

    describe('/leaveGame', () => {
      const createMemoryMatch = (
        game: Game,
        {
          numPlayers = 2,
          initialState = InitializeGame({ game, numPlayers }),
          metadata = createLeaveMetadata(),
        }: {
          numPlayers?: number;
          initialState?: ReturnType<typeof InitializeGame>;
          metadata?: Server.MatchData;
        } = {},
      ) => {
        const memory = new InMemory();
        memory.createMatch('1', { initialState, metadata });
        return memory;
      };

      beforeEach(() => {
        delete process.env.API_SECRET;
      });

      test('runs the leave lifecycle before clearing the lobby slot', async () => {
        const game = ProcessGameConfig({
          name: 'foo',
          setup: () => ({ left: null }),
          onPlayerLeave: ({ G, playerID }) => ({ ...G, left: playerID }),
        });
        const memory = createMemoryMatch(game);
        const app = createApiServer({ db: memory, auth, games: [game] });

        response = await apiCall(app)
          .post('/games/foo/1/leaveGame')
          .send('playerID=0&credentials=SECRET1');

        const { state, metadata, log } = memory.fetch('1', {
          state: true,
          metadata: true,
          log: true,
        });
        expect(response.status).toEqual(200);
        expect(state.G).toEqual({ left: '0' });
        expect(state.ctx.playOrder).toEqual(['1']);
        expect(state.ctx._removedPlayers).toEqual(['0']);
        expect(metadata.players['0']).toEqual({ id: 0 });
        expect(metadata.players['1']).toEqual({
          id: 1,
          name: 'bob',
          credentials: 'SECRET2',
        });
        expect(log.at(-1).action.type).toEqual('PLAYER_LEAVE');
      });

      test('clears the lobby slot without changing game state after gameover', async () => {
        const game = ProcessGameConfig({
          name: 'foo',
          setup: () => ({ left: null }),
          onPlayerLeave: ({ G, playerID }) => ({ ...G, left: playerID }),
        });
        const initialState = InitializeGame({ game, numPlayers: 2 });
        const memory = createMemoryMatch(game, {
          initialState: {
            ...initialState,
            ctx: { ...initialState.ctx, gameover: { winner: '1' } },
          },
        });
        const app = createApiServer({ db: memory, auth, games: [game] });

        response = await apiCall(app)
          .post('/games/foo/1/leaveGame')
          .send('playerID=0&credentials=SECRET1');

        const { state, metadata, log } = memory.fetch('1', {
          state: true,
          metadata: true,
          log: true,
        });
        expect(response.status).toEqual(200);
        expect(state.G).toEqual({ left: null });
        expect(state.ctx.gameover).toEqual({ winner: '1' });
        expect(metadata.players['0']).toEqual({ id: 0 });
        expect(log).toEqual([]);
      });

      test('does not clear the lobby slot when game leave is rejected', async () => {
        const game = ProcessGameConfig({ name: 'foo' });
        const memory = createMemoryMatch(game, {
          numPlayers: 1,
          metadata: createLeaveMetadata('foo', {
            '0': { id: 0, name: 'alice', credentials: 'SECRET1' },
          }),
        });
        const app = createApiServer({ db: memory, auth, games: [game] });

        response = await apiCall(app)
          .post('/games/foo/1/leaveGame')
          .send('playerID=0&credentials=SECRET1');

        const { state, metadata, log } = memory.fetch('1', {
          state: true,
          metadata: true,
          log: true,
        });
        expect(response.status).toEqual(400);
        expect(response.text).toEqual('action/action_invalid');
        expect(state.ctx.playOrder).toEqual(['0']);
        expect(metadata.players['0']).toEqual({
          id: 0,
          name: 'alice',
          credentials: 'SECRET1',
        });
        expect(log).toEqual([]);
      });

      test('re-authenticates before clearing the lobby slot', async () => {
        const game = ProcessGameConfig({
          name: 'foo',
          setup: () => ({ left: null }),
          onPlayerLeave: ({ G, playerID }) => ({ ...G, left: playerID }),
        });
        const initialState = InitializeGame({ game, numPlayers: 2 });
        const originalMetadata = createLeaveMetadata();
        const rejoinedMetadata = createLeaveMetadata('foo', {
          '0': { id: 0, name: 'carol', credentials: 'SECRET3' },
          '1': { id: 1, name: 'bob', credentials: 'SECRET2' },
        });
        let metadataFetches = 0;
        db = new AsyncStorage({
          fetch: async (_matchID, opts) => {
            if (opts.metadata) {
              metadataFetches++;
              return {
                metadata:
                  metadataFetches < 3 ? originalMetadata : rejoinedMetadata,
              };
            }
            if (opts.state) {
              return { state: initialState };
            }
            return {};
          },
        });
        const app = createApiServer({ db, auth, games: [game] });

        response = await apiCall(app)
          .post('/games/foo/1/leaveGame')
          .send('playerID=0&credentials=SECRET1');

        expect(response.status).toEqual(403);
        expect(response.text).toEqual('Invalid credentials SECRET1');
        expect(db.mocks.setState).toHaveBeenCalledTimes(1);
        expect(db.mocks.setMetadata).toHaveBeenCalledTimes(1);
        expect(db.mocks.setMetadata).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            players: expect.objectContaining({
              '0': expect.objectContaining({
                name: 'alice',
                credentials: 'SECRET1',
              }),
            }),
          }),
        );
        expect(db.mocks.wipe).not.toHaveBeenCalled();
      });

      test('throws when the game is not found', async () => {
        const game = ProcessGameConfig({ name: 'foo' });
        const memory = createMemoryMatch(game);
        const app = createApiServer({ db: memory, auth, games: [game] });

        response = await apiCall(app)
          .post('/games/bar/1/leaveGame')
          .send('playerID=0&credentials=SECRET1');

        expect(response.status).toEqual(404);
        expect(response.text).toEqual('Game bar not found');
      });

      test('runs the leave through the transport match queue when available', async () => {
        const game = ProcessGameConfig({
          name: 'foo',
          setup: () => ({ left: null }),
          onPlayerLeave: ({ G, playerID }) => ({ ...G, left: playerID }),
        });
        const memory = createMemoryMatch(game);
        const transportAPI = { send: jest.fn(), sendAll: jest.fn() };
        const transport = {
          createTransportAPI: jest.fn(() => transportAPI),
          getMatchQueue: jest.fn(() => ({
            add: <T>(task: () => PromiseLike<T>) => Promise.resolve(task()),
          })),
        };
        const app = createApiServer({
          db: memory,
          auth,
          games: [game],
          transport,
        });

        response = await apiCall(app)
          .post('/games/foo/1/leaveGame')
          .send('playerID=0&credentials=SECRET1');

        const { state } = memory.fetch('1', { state: true });
        expect(response.status).toEqual(200);
        expect(state.G).toEqual({ left: '0' });
        expect(transport.createTransportAPI).toHaveBeenCalledWith('1');
        expect(transport.getMatchQueue).toHaveBeenCalledWith('1');
        expect(transportAPI.sendAll).toHaveBeenCalled();
      });

      test('responds 403 when the game master rejects the credentials', async () => {
        const game = ProcessGameConfig({ name: 'foo' });
        const initialState = InitializeGame({ game, numPlayers: 2 });
        let metadataFetches = 0;
        db = new AsyncStorage({
          fetch: async (_matchID, opts) => {
            if (opts.metadata) {
              metadataFetches++;
              return {
                metadata:
                  metadataFetches < 2
                    ? createLeaveMetadata()
                    : createLeaveMetadata('foo', {
                        '0': { id: 0, name: 'carol', credentials: 'SECRET3' },
                        '1': { id: 1, name: 'bob', credentials: 'SECRET2' },
                      }),
              };
            }
            if (opts.state) {
              return { state: initialState };
            }
            return {};
          },
        });
        const app = createApiServer({ db, auth, games: [game] });

        response = await apiCall(app)
          .post('/games/foo/1/leaveGame')
          .send('playerID=0&credentials=SECRET1');

        expect(response.status).toEqual(403);
        expect(response.text).toEqual('unauthorized');
        expect(db.mocks.setState).not.toHaveBeenCalled();
        expect(db.mocks.setMetadata).not.toHaveBeenCalled();
      });
    });
  });

  describe('requesting game list', () => {
    let db: AsyncStorage;
    const auth = new Auth();
    beforeEach(() => {
      delete process.env.API_SECRET;
      db = new AsyncStorage();
    });

    describe('when given 2 games', () => {
      let response;
      beforeEach(async () => {
        const games = [ProcessGameConfig({ name: 'foo' }), { name: 'bar' }];
        const app = createApiServer({ db, auth, games });

        response = await apiCall(app).get('/games');
      });

      test('should get 2 games', async () => {
        expect(JSON.parse(response.text)).toEqual(['foo', 'bar']);
      });
    });
  });

  describe('play again', () => {
    let response;
    let db: AsyncStorage;
    const auth = new Auth();
    let games: Game[];

    beforeEach(() => {
      games = [ProcessGameConfig({ name: 'foo' })];
      delete process.env.API_SECRET;
      db = new AsyncStorage({
        fetch: async () => {
          return {
            metadata: {
              setupData: {
                colors: {
                  '0': 'green',
                  '1': 'red',
                },
              },
              players: {
                '0': {
                  name: 'alice',
                  credentials: 'SECRET1',
                },
                '1': {
                  name: 'bob',
                  credentials: 'SECRET2',
                },
                '2': {
                  name: 'chris',
                  credentials: 'SECRET3',
                },
              },
            },
          };
        },
      });
    });

    test('creates new game data', async () => {
      const uuid = () => 'newGameID';
      const app = createApiServer({ db, auth, games, uuid });

      response = await apiCall(app)
        .post('/games/foo/1/playAgain')
        .send({
          playerID: 0,
          credentials: 'SECRET1',
          numPlayers: 4,
          setupData: {
            colors: {
              '3': 'blue',
            },
          },
        });
      expect(db.mocks.createMatch).toHaveBeenCalledWith(
        'newGameID',
        expect.objectContaining({
          initialState: expect.objectContaining({
            ctx: expect.objectContaining({
              numPlayers: 4,
            }),
          }),
          metadata: expect.objectContaining({
            setupData: expect.objectContaining({
              colors: expect.objectContaining({
                '3': 'blue',
              }),
            }),
          }),
        }),
      );
      expect(response.body.nextMatchID).toBe('newGameID');
    });

    test('when game configuration not supplied, uses previous game config', async () => {
      const uuid = () => 'newGameID';
      const app = createApiServer({ db, auth, games, uuid });
      response = await apiCall(app)
        .post('/games/foo/1/playAgain')
        .send('playerID=0&credentials=SECRET1');
      expect(db.mocks.createMatch).toHaveBeenCalledWith(
        'newGameID',
        expect.objectContaining({
          initialState: expect.objectContaining({
            ctx: expect.objectContaining({
              numPlayers: 3,
            }),
          }),
          metadata: expect.objectContaining({
            setupData: expect.objectContaining({
              colors: expect.objectContaining({
                '0': 'green',
                '1': 'red',
              }),
            }),
          }),
        }),
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
      const app = createApiServer({ db, auth, games });
      response = await apiCall(app)
        .post('/games/foo/1/playAgain')
        .send('playerID=0&credentials=SECRET1');
      expect(response.body.nextMatchID).toBe('12345');
    });

    test('when the match does not exist throws a "not found" error', async () => {
      db = new AsyncStorage({
        fetch: async () => ({ metadata: null }),
      });
      const app = createApiServer({ db, auth, games });
      response = await apiCall(app)
        .post('/games/foo/1/playAgain')
        .send('playerID=0&playerName=alice');
      expect(response.status).toEqual(404);
    });

    test('when the playerID is undefined throws error 403', async () => {
      const app = createApiServer({ db, auth, games });
      response = await apiCall(app)
        .post('/games/foo/1/playAgain')
        .send('credentials=SECRET1');
      expect(response.status).toEqual(403);
    });

    test('when the playerID does not exist throws error 404', async () => {
      const app = createApiServer({ db, auth, games });
      response = await apiCall(app)
        .post('/games/foo/1/playAgain')
        .send('playerID=3&credentials=SECRET1');
      expect(response.status).toEqual(404);
    });

    test('when the credentials are invalid throws error 404', async () => {
      const app = createApiServer({ db, auth, games });
      response = await apiCall(app)
        .post('/games/foo/1/playAgain')
        .send('playerID=0&credentials=SECRET2');
      expect(response.status).toEqual(403);
    });

    test('when playerID is omitted throws error 403', async () => {
      const app = createApiServer({ db, auth, games });
      response = await apiCall(app)
        .post('/games/foo/1/leave')
        .send('credentials=foo');
      expect(response.status).toEqual(403);
    });
  });

  describe('requesting room list', () => {
    let db: AsyncStorage;
    const auth = new Auth();
    const dbFetch = jest.fn(async (matchID) => {
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
    });
    const dblistMatches = jest.fn(async (opts) => {
      const metadata = {
        'foo-0': { gameName: 'foo' },
        'foo-1': { gameName: 'foo' },
        'bar-2': { gameName: 'bar' },
        'bar-3': { gameName: 'bar' },
        'bar-4': { gameName: 'bar' },
      };
      const keys = Object.keys(metadata);
      if (opts && opts.gameName) {
        return keys.filter((key) => metadata[key].gameName === opts.gameName);
      }
      return [...keys];
    });
    beforeEach(() => {
      delete process.env.API_SECRET;
      db = new AsyncStorage({
        fetch: dbFetch,
        listMatches: dblistMatches,
      });
    });

    describe('when given 2 matches', () => {
      let response;
      let matches;
      beforeEach(async () => {
        const games = [ProcessGameConfig({ name: 'foo' }), { name: 'bar' }];
        const app = createApiServer({ db, auth, games });
        response = await apiCall(app).get('/games/bar');
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

    describe('when given filter options', () => {
      const games = [ProcessGameConfig({ name: 'foo' }), { name: 'bar' }];
      let app;

      beforeEach(() => {
        app = createApiServer({ db, auth, games });
        dblistMatches.mockClear();
      });

      describe('isGameover query param', () => {
        test('is undefined if not specified in request', async () => {
          await apiCall(app).get('/games/bar');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({ where: { isGameover: undefined } }),
          );
        });
        test('is true', async () => {
          await apiCall(app).get('/games/bar?isGameover=true');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({ where: { isGameover: true } }),
          );
        });
        test('is false', async () => {
          await apiCall(app).get('/games/bar?isGameover=false');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({ where: { isGameover: false } }),
          );
        });
        test('invalid value is ignored', async () => {
          await apiCall(app).get('/games/bar?isGameover=5');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({ where: { isGameover: undefined } }),
          );
        });
        test('uses first array value', async () => {
          await apiCall(app).get('/games/bar?isGameover=true&isGameover=false');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({ where: { isGameover: true } }),
          );
        });
      });

      describe('updatedBefore query param', () => {
        test('is undefined if not specified in request', async () => {
          await apiCall(app).get('/games/bar');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({ updatedBefore: undefined }),
            }),
          );
        });
        test('is specified', async () => {
          const timestamp = new Date(2020, 3, 4, 5, 6, 7);
          await apiCall(app).get(
            `/games/bar?updatedBefore=${timestamp.getTime()}`,
          );
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                updatedBefore: timestamp.getTime(),
              }),
            }),
          );
        });
        test('invalid value is ignored', async () => {
          await apiCall(app).get('/games/bar?updatedBefore=-5');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({ where: { updatedBefore: undefined } }),
          );
        });
        test('uses first array value', async () => {
          const t1 = new Date(2020, 3, 4, 5, 6, 7).getTime();
          const t2 = new Date(2021, 3, 4, 5, 6, 7).getTime();
          await apiCall(app).get(
            `/games/bar?updatedBefore=${t1}&updatedBefore=${t2}`,
          );
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({ updatedBefore: t1 }),
            }),
          );
        });
      });

      describe('updatedAfter query param', () => {
        test('is undefined if not specified in request', async () => {
          await apiCall(app).get('/games/bar');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({ updatedAfter: undefined }),
            }),
          );
        });
        test('is specified', async () => {
          const timestamp = new Date(2020, 3, 4, 5, 6, 7);
          await apiCall(app).get(
            `/games/bar?updatedAfter=${timestamp.getTime()}`,
          );
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                updatedAfter: timestamp.getTime(),
              }),
            }),
          );
        });
        test('invalid value is ignored', async () => {
          await apiCall(app).get('/games/bar?updatedAfter=-5');
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({ where: { updatedAfter: undefined } }),
          );
        });
        test('uses first array value', async () => {
          const t1 = new Date(2020, 3, 4, 5, 6, 7).getTime();
          const t2 = new Date(2021, 3, 4, 5, 6, 7).getTime();
          await apiCall(app).get(
            `/games/bar?updatedAfter=${t1}&updatedAfter=${t2}`,
          );
          expect(dblistMatches).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({ updatedAfter: t1 }),
            }),
          );
        });
      });
    });
  });

  describe('requesting room', () => {
    let db: AsyncStorage;
    const auth = new Auth();
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
        listMatches: async () => {
          return ['bar:bar-0', 'foo:foo-0', 'bar:bar-1'];
        },
      });
    });

    describe('when given room ID', () => {
      let response;
      let room;
      beforeEach(async () => {
        const games = [ProcessGameConfig({ name: 'foo' }), { name: 'bar' }];
        const app = createApiServer({ db, auth, games });
        response = await apiCall(app).get('/games/bar/bar-0');
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
        const games = [ProcessGameConfig({ name: 'foo' })];
        const app = createApiServer({ db, auth, games });
        response = await apiCall(app).get('/games/bar/doesnotexist');
      });

      test('throws error 404', async () => {
        expect(response.status).toEqual(404);
      });
    });
  });

  describe('when server app is provided', () => {
    let db: AsyncStorage;
    const auth = new Auth();
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
      addApiToServer({ app: server, db, auth, games });
      expect(server.use.mock.calls.length).toBeGreaterThan(1);
    });

    test('call .use method several times with uuid', async () => {
      const uuid = () => 'foo';
      addApiToServer({ app: server, db, auth, games, uuid });
      expect(server.use.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('cors', () => {
    const auth = new Auth();
    const games: Game[] = [];
    const db = new AsyncStorage();

    describe('no allowed origins', () => {
      const app = createApiServer({ auth, games, db, origins: false });

      test('does not allow CORS', async () => {
        const res = await apiCall(app)
          .get('/games')
          .set('Origin', 'https://www.example.com')
          .expect('Vary', 'Origin');
        expect(res.headers).not.toHaveProperty('access-control-allow-origin');
        expect(res.headers).not.toHaveProperty('Access-Control-Allow-Origin');
      });
    });

    describe('single allowed origin', () => {
      const origin = 'https://www.example.com';
      const app = createApiServer({ auth, games, db, origins: origin });

      test('disallows non-matching origin', async () => {
        const res = await apiCall(app)
          .get('/games')
          .set('Origin', 'https://www.other.com')
          .expect('Vary', 'Origin');
        expect(res.headers).not.toHaveProperty('access-control-allow-origin');
        expect(res.headers).not.toHaveProperty('Access-Control-Allow-Origin');
      });

      // eslint-disable-next-line jest/expect-expect
      test('allows matching origin', async () => {
        await apiCall(app)
          .get('/games')
          .set('Origin', origin)
          .expect('Vary', 'Origin')
          .expect('Access-Control-Allow-Origin', origin);
      });
    });

    describe('multiple allowed origins', () => {
      const origins = [Origins.LOCALHOST, 'https://www.example.com'];
      const app = createApiServer({ auth, games, db, origins });

      test('disallows non-matching origin', async () => {
        const res = await apiCall(app)
          .get('/games')
          .set('Origin', 'https://www.other.com')
          .expect('Vary', 'Origin');
        expect(res.headers).not.toHaveProperty('access-control-allow-origin');
        expect(res.headers).not.toHaveProperty('Access-Control-Allow-Origin');
      });

      // eslint-disable-next-line jest/expect-expect
      test('allows matching origin', async () => {
        const origin = 'http://localhost:5000';
        await apiCall(app)
          .get('/games')
          .set('Origin', origin)
          .expect('Vary', 'Origin')
          .expect('Access-Control-Allow-Origin', origin);
      });
    });
  });
});
