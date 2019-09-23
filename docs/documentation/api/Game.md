# Game

```js
{
  // The name of the game.
  name: 'tic-tac-toe',

  // Function that returns the initial value of G.
  // setupData is an optional custom object that is
  // passed through the Game Creation API.
  setup: (ctx, setupData) => G,

  moves: {
    // short-form move.
    A: (G, ctx) => {},

    // long-form move.
    B: {
      fn: (G, ctx) => {},
      undoable: false,
      redacted: true,
    },
    ...
  },

  playerView: ...

  seed: ...

  turn: {
    onBegin:
    onEnd:
    endIf:
    moveLimit: 1,
    onMove:

    stages: {
      A: {
      },

      ...
    },
  },

  phases: {
    A: {
      onBegin:
      onEnd:
      endIf:
    },

    ...
  },

  endIf: ...
}
```
