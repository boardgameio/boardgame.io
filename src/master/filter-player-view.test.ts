import { getFilterPlayerView, redactLog } from './filter-player-view';
import * as ActionCreators from '../core/action-creators';
import { Master } from './master';
import { InMemory } from '../server/db/inmemory';
import { PlayerView } from '../core/player-view';
import { INVALID_MOVE } from '../core/constants';
import type { Game, SyncInfo } from '../types';

function TransportAPI(send = jest.fn(), sendAll = jest.fn()) {
  return { send, sendAll };
}

function validateNotTransientState(state: any) {
  expect(state).toEqual(
    expect.not.objectContaining({ transients: expect.anything() }),
  );
}

describe('playerView - update', () => {
  const send = jest.fn();
  const sendAll = jest.fn();
  const game: Game = {
    playerView: ({ G, playerID }) => {
      return { ...G, player: playerID };
    },
  };
  const master = new Master(game, new InMemory(), TransportAPI(send, sendAll));

  beforeAll(async () => {
    await master.onSync('matchID', '0', undefined, 2);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sync', async () => {
    await master.onSync('matchID', '0', undefined, 2);
    const payload = send.mock.calls[0][0];
    const filterPlayerView = getFilterPlayerView(game);
    expect(
      (filterPlayerView('0', payload).args[1] as SyncInfo).state,
    ).toMatchObject({
      G: { player: '0' },
    });
  });

  test('update', async () => {
    const action = ActionCreators.gameEvent('endTurn');
    await master.onSync('matchID', '0', undefined, 2);
    await master.onUpdate(action, 0, 'matchID', '0');
    const payload = sendAll.mock.calls.at(-1)[0];
    const filterPlayerView = getFilterPlayerView(game);

    const transportData0 = filterPlayerView('0', payload);
    const G_player0 = (transportData0.args[1] as any).G;
    const transportData1 = filterPlayerView('1', payload);
    const G_player1 = (transportData1.args[1] as any).G;

    expect(G_player0.player).toBe('0');
    expect(G_player1.player).toBe('1');
  });
});

describe('playerView - sync initialState', () => {
  const send = jest.fn();
  // No `seed` in the config, so the random plugin generates one in setup.
  const game: Game = {
    setup: ({ random }) => ({
      secret: { deck: random.Shuffle(['a', 'b', 'c', 'd', 'e']) },
      players: { '0': { hand: ['zero'] }, '1': { hand: ['one'] } },
    }),
    playerView: PlayerView.STRIP_SECRETS,
  };
  const master = new Master(game, new InMemory(), TransportAPI(send));
  const filterPlayerView = getFilterPlayerView(game);

  beforeAll(async () => {
    await master.onSync('matchID', '0', undefined, 2);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const syncInfoFor = async (playerID: string | null) => {
    await master.onSync('matchID', playerID, undefined, 2);
    const payload = send.mock.calls.at(-1)[0];
    return filterPlayerView(playerID, payload).args[1] as SyncInfo;
  };

  test('spectators do not receive secrets or the seed in initialState', async () => {
    const { state, initialState } = await syncInfoFor(null);
    expect(state.plugins.random.data).toBeUndefined();
    expect(initialState.plugins.random.data).toBeUndefined();
    expect(state.G).toEqual({ players: {} });
    expect(initialState.G).toEqual({ players: {} });
  });

  test('players only receive their own view of initialState', async () => {
    const { state, initialState } = await syncInfoFor('1');
    expect(initialState.G).toEqual({ players: { '1': { hand: ['one'] } } });
    expect(initialState.G).toEqual(state.G);
    expect(initialState.plugins.random.data).toBeUndefined();
  });
});

describe('playerView - patch', () => {
  const send = jest.fn();
  const sendAll = jest.fn();
  const db = new InMemory();
  const game: Game = {
    seed: 0,
    deltaState: true,
    setup: () => {
      return {
        players: {
          '0': {
            cards: ['card3'],
          },
          '1': {
            cards: [],
          },
        },
        cards: ['card0', 'card1', 'card2'],
        discardedCards: [],
      };
    },
    playerView: PlayerView.STRIP_SECRETS,
    turn: {
      activePlayers: { currentPlayer: { stage: 'A' } },
      stages: {
        A: {
          moves: {
            Invalid: () => {
              return INVALID_MOVE;
            },
            A: {
              client: false,
              move: ({ G, playerID }) => {
                const card = G.players[playerID].cards.shift();
                G.discardedCards.push(card);
              },
            },
            B: {
              client: false,
              ignoreStaleStateID: true,
              move: ({ G, playerID }) => {
                const card = G.cards.pop();
                G.players[playerID].cards.push(card);
              },
            },
          },
        },
      },
    },
  };
  const master = new Master(game, db, TransportAPI(send, sendAll));
  const move = ActionCreators.makeMove('A', null, '0');

  beforeAll(async () => {
    master.subscribe(({ state }) => {
      validateNotTransientState(state);
    });
    await master.onSync('matchID', '0', undefined, 2);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('patch', async () => {
    await master.onUpdate(move, 0, 'matchID', '0');
    expect(sendAll).toHaveBeenCalled();

    const payload = sendAll.mock.calls.at(-1)[0];
    expect(payload.type).toBe('patch');

    const filterPlayerView = getFilterPlayerView(game);
    const value = filterPlayerView('0', payload);
    expect(value.type).toBe('patch');
    expect(value.args[0]).toBe('matchID');
    expect(value.args[1]).toBe(0);
    expect(value.args[2]).toBe(1);
    expect(value.args[3]).toMatchObject([
      { op: 'remove', path: '/G/players/0/cards/0' },
      { op: 'add', path: '/G/discardedCards/-', value: 'card3' },
      { op: 'replace', path: '/ctx/numMoves', value: 1 },
      { op: 'replace', path: '/_stateID', value: 1 },
    ]);
  });
});

describe('redactLog', () => {
  test('no-op with undefined log', () => {
    const result = redactLog(undefined, '0');
    expect(result).toBeUndefined();
  });

  test('no redactedMoves', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.gameEvent('endTurn'),
      },
    ];
    const result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
  });

  test('redacted move is only shown with args to the player that made the move', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.makeMove('clickCell', [1, 2, 3], '0'),
        redact: true,
      },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);

    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject([
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: {
          type: 'MAKE_MOVE',
          payload: {
            credentials: undefined,
            playerID: '0',
            type: 'clickCell',
          },
        },
      },
    ]);
  });

  test('not redacted move is shown to all', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.makeMove('unclickCell', [1, 2, 3], '0'),
      },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject(logEvents);
  });

  test('can explicitly set showing args to true', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.makeMove('unclickCell', [1, 2, 3], '0'),
      },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject(logEvents);
  });

  test('actions without args are not redacted', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.playerLeave('0'),
        redact: true,
      },
    ];

    const result = redactLog(logEvents, '1');
    expect(result).toMatchObject(logEvents);
  });

  test('events are not redacted', () => {
    const logEvents = [
      {
        _stateID: 0,
        turn: 0,
        phase: '',
        action: ActionCreators.gameEvent('endTurn'),
      },
    ];

    // player that made the move
    let result = redactLog(logEvents, '0');
    expect(result).toMatchObject(logEvents);
    // other player
    result = redactLog(logEvents, '1');
    expect(result).toMatchObject(logEvents);
  });

  test('make sure filter player view redacts the log', async () => {
    const game: Game = {
      moves: {
        A: ({ G }) => G,
        B: {
          move: ({ G }) => G,
          redact: true,
        },
      },
    };

    const send = jest.fn();
    const master = new Master(game, new InMemory(), TransportAPI(send));
    const filterPlayerView = getFilterPlayerView(game);

    const actionA = ActionCreators.makeMove('A', ['not redacted'], '0');
    const actionB = ActionCreators.makeMove('B', ['redacted'], '0');

    // test: ping-pong two moves, then sync and check the log
    await master.onSync('matchID', '0', undefined, 2);
    await master.onUpdate(actionA, 0, 'matchID', '0');
    await master.onUpdate(actionB, 1, 'matchID', '0');
    await master.onSync('matchID', '1', undefined, 2);

    const payload = send.mock.calls.at(-1)[0];
    expect(
      (filterPlayerView('1', payload).args[1] as SyncInfo).log,
    ).toMatchObject([
      {
        action: {
          type: 'MAKE_MOVE',
          payload: {
            type: 'A',
            args: ['not redacted'],
            playerID: '0',
          },
        },
        _stateID: 0,
      },
      {
        action: {
          type: 'MAKE_MOVE',
          payload: {
            type: 'B',
            args: null,
            playerID: '0',
          },
        },
        _stateID: 1,
      },
    ]);
  });
});

test('make move args to be secret depends on G via conditional redact', async () => {
  const game: Game = {
    setup: () => ({
      isASecret: false,
    }),
    moves: {
      A: {
        move: ({ G }) => G,
        redact: ({ G }) => G.isASecret,
      },
      B: ({ G }) => {
        return { ...G, isASecret: true };
      },
    },
  };

  const send = jest.fn();
  const master = new Master(game, new InMemory(), TransportAPI(send));
  const filterPlayerView = getFilterPlayerView(game);

  const actionA0 = ActionCreators.makeMove('A', ['not redacted'], '0');
  const actionB = ActionCreators.makeMove('B', ['not redacted'], '0');
  const actionA1 = ActionCreators.makeMove('A', ['redacted'], '0');

  // test: ping-pong two moves, then sync and check the log
  await master.onSync('matchID', '0', undefined, 2);
  await master.onUpdate(actionA0, 0, 'matchID', '0');
  await master.onUpdate(actionB, 1, 'matchID', '0');
  await master.onUpdate(actionA1, 2, 'matchID', '0');
  await master.onSync('matchID', '1', undefined, 2);

  const payload = send.mock.calls.at(-1)[0];
  expect(
    (filterPlayerView('1', payload).args[1] as SyncInfo).log,
  ).toMatchObject([
    {
      action: {
        type: 'MAKE_MOVE',
        payload: {
          type: 'A',
          args: ['not redacted'],
          playerID: '0',
        },
      },
      _stateID: 0,
    },
    {
      action: {
        type: 'MAKE_MOVE',
        payload: {
          type: 'B',
          args: ['not redacted'],
          playerID: '0',
        },
      },
      _stateID: 1,
    },
    {
      action: {
        type: 'MAKE_MOVE',
        payload: {
          type: 'A',
          args: null,
          playerID: '0',
        },
      },
      _stateID: 2,
    },
  ]);
});
