import { Client } from '../client/client';
import type { Game } from '../types';

describe('plugin-serializable', () => {
  let client: ReturnType<typeof Client>;

  beforeAll(() => {
    const game: Game = {
      moves: {
        serializable: () => {
          return { hello: 'world' };
        },

        nonSerializable: () => {
          class Foo {
            a: number;
            constructor(a: number) {
              this.a = a;
            }
          }
          return { hello: new Foo(1) };
        },
      },
    };

    client = Client({ game });
  });

  test('does not throw for serializable move', () => {
    expect(() => {
      client.moves.serializable();
    }).not.toThrow();
  });

  test('throws for non-serializable move', () => {
    expect(() => {
      client.moves.nonSerializable();
    }).toThrow();
  });
});
