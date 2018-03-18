# Turn Order

The framework maintains the turn order using the following fields:

```
ctx: {
  currentPlayer: '0',
  playOrder: ['0', '1', '2', ...],
  playOrderPos: 0,
}
```

`playOrderPos` is an index into `playOrder` and the way in which it
is updated is determined by a particular `TurnOrder`. The default
behavior is to just increment it in a round-robin fashion.
`currentPlayer` is just `playerOrder[playOrderPos]`.

If you need something different, you can customize this behavior
by using the `turnOrder` option. This is passed inside a `flow`
section of the `Game` configuration. The framework comes bundled
with a few turn orders in the `TurnOrder` object, and you can
even provide your own implementation.

```js
import { Game, TurnOrder } from 'boardgame.io/core';

Game({
  moves: {
    ...
  },

  flow: {
    turnOrder: TurnOrder.DEFAULT,
  }
}
```

!> Turn orders can also be specified on a per-phase level.

#### Custom Turn Order

A `TurnOrder` object has the following structure:

```js
{
  // Get the initial value of playOrderPos,
  first: (G, ctx) => 0,

  // Get the next value of playOrderPos when endTurn is called.
  next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
}
```

The implementation above shows the default round-robin order.
If you want to skip over every other player (for example), do
something like this:

```js
import { Game } from 'boardgame.io/core';

Game({
  moves: {
    ...
  },

  flow: {
    turnOrder: {
      first: () => 0,
      next: (G, ctx) => (ctx.playOrderPos + 2) % ctx.numPlayers,
    }
  }
}
```

!> If you would like any player to play, then return `undefined` from
these functions. `TurnOrder.ANY` implements this.
