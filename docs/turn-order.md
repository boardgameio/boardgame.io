# Turn Order

You can customize the order in which the turn gets passed between players
by using the `turnOrder` option. This is passed inside a `flow` section of
the `Game` configuration.

The default turn order (round-robin) is called `TurnOrder.DEFAULT`.

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

A `TurnOrder` object has the following structure:

```js
{
  // Get the first player.
  first: (G, ctx) => startingPlayer,

  // Get the next player when endTurn is called.
  next: (G, ctx) => nextPlayer
}
```

!> `TurnOrder.ANY` implements a turn order where any player can play,
and there isn't really a concept of a current player.
