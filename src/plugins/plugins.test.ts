import { Client } from '../client/client';

jest.mock('../core/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('plugins are accessible in events triggered from moves', () => {
  test('turn/onEnd', () => {
    const game = {
      moves: {
        stop: (G, ctx) => ctx.events.endTurn(),
      },
      turn: {
        onEnd: (G, ctx) => {
          G.onEnd = ctx.random.Die(1);
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onEnd: 1,
    });
  });

  test('phase/onEnd', () => {
    const game = {
      moves: {
        stop: (G, ctx) => ctx.events.endPhase(),
      },
      phases: {
        first: {
          start: true,
          onEnd: (G, ctx) => {
            G.onEnd = ctx.random.Die(1);
          },
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onEnd: 1,
    });
  });

  test('phase/onBegin', () => {
    const game = {
      moves: {
        stop: (G, ctx) => ctx.events.setPhase('second'),
      },
      phases: {
        first: {
          start: true,
        },
        second: {
          onBegin: (G, ctx) => {
            G.onEnd = ctx.random.Die(1);
          },
        },
      },
    };

    const client = Client({ game });
    client.moves.stop();
    expect(client.getState().G).toEqual({
      onEnd: 1,
    });
  });
});
