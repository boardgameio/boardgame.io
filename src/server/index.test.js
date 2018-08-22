/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Server } from './index';
import Game from '../core/game';

const game = Game({ seed: 0 });

jest.mock('./api', () => ({
  createApiServer: () => ({
    listen: async () => {},
  }),
}));

jest.mock('koa', () => {
  return class {
    constructor() {
      this.context = {};
    }

    callback() {}
    async listen() {}
  };
});

test('basic', async () => {
  const server = Server({ games: [game] });
  await server.run();
  expect(server).not.toBe(undefined);
});

test('custom db implementation', async () => {
  const game = Game({});
  const db = {};
  const server = Server({ games: [game], db });
  expect(server.db).toBe(db);
});

test('custom transport implementation', async () => {
  const game = Game({});
  const transport = { init: jest.fn() };
  Server({ games: [game], transport });
  expect(transport.init).toBeCalled();
});

// describe('error log', () => {
//   const game2 = Game({
//     seed: 0,
//     flow: FlowWithPhases({ setActionPlayers: true }),
//   });
//   const log = jest.fn();
//   const server = Server({ games: [game2], log });
//   const io = server.app.context.io;
//   const endTurnEvent = ActionCreators.gameEvent('endTurn');

//   beforeAll(async () => {
//     // create game called "gameID"
//     await io.socket.receive('sync', 'gameID');
//   });

//   beforeEach(() => {
//     io.socket.emit.mockReset();
//     log.mockReset();
//   });

//   test('writes log when gameID not found', async () => {
//     await io.socket.receive('update', endTurnEvent, 1, 'unknown', '0');
//     expect(log).toHaveBeenCalledWith(`game not found, gameID=[unknown]`);
//   });

//   test('writes log on an invalid stateID', async () => {
//     await io.socket.receive('update', endTurnEvent, 100, 'gameID', '0');
//     expect(log).toHaveBeenCalledWith(
//       `invalid stateID, was=[100], expected=[0]`
//     );
//   });

//   test('writes log when a player is not on turn', async () => {
//     await io.socket.receive('update', endTurnEvent, 0, 'gameID', '100');
//     expect(log).toHaveBeenCalledWith(
//       `event not processed - invalid playerID=[100]`
//     );
//   });

//   test('writes log when player is not an action player', async () => {
//     const setActionPlayersEvent = ActionCreators.gameEvent('setActionPlayers', [
//       '1',
//     ]);
//     await io.socket.receive('update', setActionPlayersEvent, 0, 'gameID', '0');

//     const move = ActionCreators.makeMove('move');
//     await io.socket.receive('update', move, 1, 'gameID', '0');
//     expect(log).toHaveBeenCalledWith(
//       `move not processed - canPlayerMakeMove=false, playerID=[0]`
//     );
//   });
// });
