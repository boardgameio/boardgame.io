import { getFilterPlayerView, redactLog } from './filter-player-view';
import * as ActionCreators from '../core/action-creators';
import { Master } from './master';
import { InMemory } from '../server/db/inmemory';

function TransportAPI(send = jest.fn(), sendAll = jest.fn()) {
  return { send, sendAll };
}

describe('playerView', () => {
  const send = jest.fn();
  const sendAll = jest.fn();
  const game = {
    playerView: (G, ctx, player) => {
      return { ...G, player };
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
    expect(send.mock.calls[0][0].args[1].state).toMatchObject({
      G: { player: '0' },
    });
  });

  test('update', async () => {
    const action = ActionCreators.gameEvent('endTurn');
    await master.onSync('matchID', '0', undefined, 2);
    await master.onUpdate(action, 0, 'matchID', '0');
    const payload = sendAll.mock.calls[sendAll.mock.calls.length - 1][0];
    const filterPlayerView = getFilterPlayerView(game);

    const transportData0 = filterPlayerView('0', payload);
    const G_player0 = (transportData0.args[1] as any).G;
    const transportData1 = filterPlayerView('1', payload);
    const G_player1 = (transportData1.args[1] as any).G;

    expect(G_player0.player).toBe('0');
    expect(G_player1.player).toBe('1');
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

  test('make sure sync redacts the log', async () => {
    const game = {
      moves: {
        A: (G) => G,
        B: {
          move: (G) => G,
          redact: true,
        },
      },
    };

    const send = jest.fn();
    const master = new Master(game, new InMemory(), TransportAPI(send));

    const actionA = ActionCreators.makeMove('A', ['not redacted'], '0');
    const actionB = ActionCreators.makeMove('B', ['redacted'], '0');

    // test: ping-pong two moves, then sync and check the log
    await master.onSync('matchID', '0', undefined, 2);
    await master.onUpdate(actionA, 0, 'matchID', '0');
    await master.onUpdate(actionB, 1, 'matchID', '0');
    await master.onSync('matchID', '1', undefined, 2);

    const { log } = send.mock.calls[send.mock.calls.length - 1][0].args[1];
    expect(log).toMatchObject([
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
