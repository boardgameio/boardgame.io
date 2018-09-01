/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Game from '../core/game';
import * as ActionCreators from '../core/action-creators';
import * as Redux from 'redux';
import { InMemory } from '../server/db/inmemory';
import { Master } from './master';
import { error } from '../core/logger';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const game = Game({ seed: 0, flow: { setActionPlayers: true } });

function TransportAPI(send = jest.fn(), sendAll = jest.fn()) {
  return { send, sendAll };
}

describe('sync', async () => {
  const send = jest.fn();
  const master = new Master(game, new InMemory(), TransportAPI(send));
  const spy = jest.spyOn(Redux, 'createStore');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('causes server to respond', async () => {
    await master.onSync('gameID', '0', 2);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'sync',
      })
    );
    expect(spy).toHaveBeenCalled();
  });

  test('sync a second time does not create a game', async () => {
    await master.onSync('gameID', '0', 2);
    expect(send).toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });

  afterAll(() => {
    spy.mockRestore();
  });
});

describe('update', async () => {
  let sendAllReturn;

  const send = jest.fn();
  const sendAll = jest.fn(arg => {
    sendAllReturn = arg;
  });
  const master = new Master(game, new InMemory(), TransportAPI(send, sendAll));
  const action = ActionCreators.gameEvent('endTurn');

  beforeAll(async () => {
    await master.onSync('gameID', '0');
  });

  beforeEach(() => {
    sendAllReturn = undefined;
    jest.clearAllMocks();
  });

  test('basic', async () => {
    await master.onUpdate(action, 0, 'gameID', '0');
    expect(sendAll).toBeCalled();
    expect(sendAllReturn).not.toBeUndefined();

    let value = sendAllReturn('0');
    expect(value.type).toBe('update');
    expect(value.args[0]).toBe('gameID');
    expect(value.args[1]).toMatchObject({
      G: {},
      deltalog: undefined,
      log: undefined,
      _initial: {
        G: {},
        _initial: {},
        _redo: [],
        _stateID: 0,
        _undo: [
          {
            G: {},
            ctx: {
              _random: { seed: 0 },
              actionPlayers: ['0'],
              allPlayed: false,
              allowedMoves: null,
              currentPlayer: '0',
              currentPlayerMoves: 0,
              numPlayers: 2,
              phase: 'default',
              playOrder: ['0', '1'],
              playOrderPos: 0,
              stats: {
                phase: { allPlayed: false, numMoves: {} },
                turn: { numMoves: {} },
              },
              turn: 0,
            },
          },
        ],
        ctx: {
          _random: { seed: 0 },
          actionPlayers: ['0'],
          allPlayed: false,
          allowedMoves: null,
          currentPlayer: '0',
          currentPlayerMoves: 0,
          numPlayers: 2,
          phase: 'default',
          playOrder: ['0', '1'],
          playOrderPos: 0,
          stats: {
            phase: { allPlayed: false, numMoves: {} },
            turn: { allPlayed: false, numMoves: {} },
          },
          turn: 0,
        },
      },
      _redo: [],
      _stateID: 1,
      _undo: [
        {
          G: {},
          ctx: {
            _random: { seed: 0 },
            actionPlayers: ['1'],
            allPlayed: false,
            allowedMoves: null,
            currentPlayer: '1',
            currentPlayerMoves: 0,
            numPlayers: 2,
            phase: 'default',
            playOrder: ['0', '1'],
            playOrderPos: 1,
            stats: {
              phase: { allPlayed: false, numMoves: {} },
              turn: { allPlayed: false, numMoves: {} },
            },
            turn: 1,
          },
        },
      ],
      ctx: {
        _random: undefined,
        actionPlayers: ['1'],
        allPlayed: false,
        allowedMoves: null,
        currentPlayer: '1',
        currentPlayerMoves: 0,
        numPlayers: 2,
        phase: 'default',
        playOrder: ['0', '1'],
        playOrderPos: 1,
        stats: {
          phase: { allPlayed: false, numMoves: {} },
          turn: { allPlayed: false, numMoves: {} },
        },
        turn: 1,
      },
    });

    expect(value.args[2]).toMatchObject([
      {
        action: {
          payload: {
            args: undefined,
            credentials: undefined,
            playerID: undefined,
            type: 'endTurn',
          },
          type: 'GAME_EVENT',
        },
      },
    ]);
  });

  test('invalid gameID', async () => {
    await master.onUpdate(action, 1, 'unknown', '1');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(`game not found, gameID=[unknown]`);
  });

  test('invalid stateID', async () => {
    await master.onUpdate(action, 100, 'gameID', '1');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `invalid stateID, was=[100], expected=[1]`
    );
  });

  test('invalid playerID', async () => {
    await master.onUpdate(action, 1, 'gameID', '100');
    await master.onUpdate(ActionCreators.makeMove(), 1, 'gameID', '100');
    expect(sendAll).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      `event not processed - invalid playerID=[100]`
    );
  });

  test('valid gameID / stateID / playerID', async () => {
    await master.onUpdate(action, 1, 'gameID', '1');
    expect(sendAll).toHaveBeenCalled();
  });

  test('writes log when player is not an action player', async () => {
    const setActionPlayersEvent = ActionCreators.gameEvent('setActionPlayers', [
      '1',
    ]);
    await master.onUpdate(setActionPlayersEvent, 2, 'gameID', '0');

    const move = ActionCreators.makeMove('move');
    await master.onUpdate(move, 3, 'gameID', '0');
    expect(error).toHaveBeenCalledWith(
      `move not processed - canPlayerMakeMove=false, playerID=[0]`
    );
  });
});

describe('playerView', () => {
  let sendAllReturn;
  let sendReturn;

  const send = jest.fn(arg => {
    sendReturn = arg;
  });
  const sendAll = jest.fn(arg => {
    sendAllReturn = arg;
  });
  const game = Game({
    playerView: (G, ctx, player) => {
      return { ...G, player };
    },
  });
  const master = new Master(game, new InMemory(), TransportAPI(send, sendAll));

  beforeAll(async () => {
    await master.onSync('gameID', '0');
  });

  beforeEach(() => {
    sendReturn = undefined;
    sendAllReturn = undefined;
    jest.clearAllMocks();
  });

  test('sync', async () => {
    await master.onSync('gameID', '0');
    expect(sendReturn.args[1]).toMatchObject({
      G: { player: '0' },
    });
  });

  test('update', async () => {
    const action = ActionCreators.gameEvent('endTurn');
    await master.onSync('gameID', '0');
    await master.onUpdate(action, 0, 'gameID', '0');

    const G_player0 = sendAllReturn('0').args[1].G;
    const G_player1 = sendAllReturn('1').args[1].G;

    expect(G_player0.player).toBe('0');
    expect(G_player1.player).toBe('1');
  });
});

describe('authentication', async () => {
  const send = jest.fn();
  const sendAll = jest.fn();
  const game = Game({ seed: 0 });
  const action = ActionCreators.gameEvent('endTurn');
  const storage = new InMemory();

  beforeAll(async () => {
    const master = new Master(game, storage, TransportAPI());
    await master.onSync('gameID', '0');
  });

  test('auth failure', async () => {
    const isActionFromAuthenticPlayer = () => false;
    const master = new Master(
      game,
      storage,
      TransportAPI(send, sendAll),
      isActionFromAuthenticPlayer
    );
    await master.onUpdate(action, 0, 'gameID', '0');
    expect(sendAll).not.toHaveBeenCalled();
  });

  test('auth success', async () => {
    const isActionFromAuthenticPlayer = () => true;
    const master = new Master(
      game,
      storage,
      TransportAPI(send, sendAll),
      isActionFromAuthenticPlayer
    );
    await master.onUpdate(action, 0, 'gameID', '0');
    expect(sendAll).toHaveBeenCalled();
  });
});
