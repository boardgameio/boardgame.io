/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { Local, LocalMaster } from './local';
import Game from '../../core/game';
import { makeMove, gameEvent } from '../../core/action-creators';
import { CreateGameReducer } from '../../core/reducer';

describe('LocalMaster', () => {
  const game = Game({});
  const master = LocalMaster(game);

  const storeA = { dispatch: jest.fn(), getState: () => ({ _stateID: 0 }) };
  const storeB = { dispatch: jest.fn(), getState: () => ({ _stateID: 0 }) };

  const localA = new Local({ master, store: storeA, playerID: '0' });
  const localB = new Local({ master, store: storeB, playerID: '1' });

  beforeEach(() => {
    storeA.dispatch = jest.fn();
    storeB.dispatch = jest.fn();
  });

  test('connect', async () => {
    await localA.connect();
    await localB.connect();
    localA.subscribe();

    expect(storeA.dispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'SYNC',
      })
    );
    expect(storeB.dispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'SYNC',
      })
    );
  });

  test('update', async () => {
    await localA.onAction({ _stateID: 0 }, gameEvent('endTurn'));

    expect(storeA.dispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'UPDATE',
      })
    );
    expect(storeB.dispatch).toBeCalledWith(
      expect.objectContaining({
        type: 'UPDATE',
      })
    );
  });

  test('connect without callback', async () => {
    master.connect('gameID', '0', undefined);
    await master.onSync('gameID', '0');
  });
});

describe('Local', () => {
  describe('update gameID / playerID', () => {
    const master = { onSync: jest.fn() };
    const store = { dispatch: () => {} };
    const m = new Local({ master, store });

    test('gameID', async () => {
      await m.updateGameID('test');
      expect(m.gameID).toBe('default:test');
      expect(master.onSync).lastCalledWith('default:test', null, 2);
    });

    test('playerID', async () => {
      await m.updatePlayerID('player');
      expect(m.playerID).toBe('player');
      expect(master.onSync).lastCalledWith('default:test', 'player', 2);
    });
  });

  describe('multiplayer', () => {
    const master = { onSync: jest.fn(), onUpdate: jest.fn() };
    const m = new Local({ master });
    const game = Game({});
    let store = null;

    beforeEach(() => {
      m.store = store = createStore(CreateGameReducer({ game }));
    });

    test('returns a valid store', () => {
      expect(store).not.toBe(undefined);
    });

    test('receive update', () => {
      const restored = { restore: true };
      expect(store.getState()).not.toMatchObject(restored);
      m.onUpdate('unknown gameID', restored);
      expect(store.getState()).not.toMatchObject(restored);
      m.onUpdate('default:default', restored);
      expect(store.getState()).not.toMatchObject(restored);

      // Only if the stateID is not stale.
      restored._stateID = 1;
      m.onUpdate('default:default', restored);
      expect(store.getState()).toMatchObject(restored);
    });

    test('receive sync', () => {
      const restored = { restore: true };
      expect(store.getState()).not.toMatchObject(restored);
      m.onSync('unknown gameID', restored);
      expect(store.getState()).not.toMatchObject(restored);
      m.onSync('default:default', restored);
      expect(store.getState()).toMatchObject(restored);
    });

    test('send update', () => {
      const action = makeMove();
      const state = { _stateID: 0 };
      m.onAction(state, action);
      expect(m.master.onUpdate).lastCalledWith(
        action,
        state._stateID,
        'default:default',
        null
      );
    });
  });
});
