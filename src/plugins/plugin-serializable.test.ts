import { Client } from '../client/client';

describe('plugin-serializable', () => {
  let client;

  beforeAll(() => {
    const game = {
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
