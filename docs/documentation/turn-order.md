# Turn Order

The framework's default behavior is to pass the turn around
in a round-robin fashion. Players make one or more moves
before triggering an `endTurn` event, which passes the turn
to the next player.

Turn order state is maintained in the following fields:

```
ctx: {
  currentPlayer: '0',
  playOrder: ['0', '1', '2', ...],
  playOrderPos: 0,
}
```

##### `currentPlayer`

This is the owner of the current turn.

##### `playOrder`

The default value is `['0', '1', ... ]`. You can think of this
as the order in which players sit down at the table. A round
robin turn order would move `currentPlayer` through this
list in order.

##### `playOrderPos`

An index into `playOrder`. It is the value that is updated
by the turn order policy in order to compute `currentPlayer`.
The default behavior is to just increment it in a round-robin
fashion. `currentPlayer` is just `playOrder[playOrderPos]`.

!> The player that just made a move is available at
`ctx.playerID` in case you need to differentiate between
multiple players that could simultaneously move.

### Presets

##### DEFAULT

This is the default round-robin. It is used if you don't
specify any turn order. It goes on indefinitely until you
end the phase, at which point the next phase's turn order
kicks in. Note that if the next phase also uses
`DEFAULT`, the turn order will continue passing
around in a round-robin seamlessly.

##### RESET

This is similar to `DEFAULT`, but instead of continuing
from the previous position at the beginning of a phase, it
will always start from `0`.

##### ONCE

This is another round-robin, but it goes around only once.
After this, the phase ends automatically.

##### CUSTOM

Round-robin like `DEFAULT`, but sets `playOrder` to the provided
value.

##### CUSTOM_FROM

Round-robin like `DEFAULT`, but sets `playOrder` to the value
in a specified field in `G`.

### Changing the Turn Order

You can change the turn order by using the `turn.order` option.
This can be passed inside your game configuration:

```js
import { TurnOrder } from 'boardgame.io/core';

export const game = {
  turn: {
    order: TurnOrder.ONCE,
  },
};
```

Turn orders can also be specified on a per-phase level.

```js
import { TurnOrder } from 'boardgame.io/core';

export const game = {
  phases: {
    A: {
      turn: { order: TurnOrder.ONCE },
    },
    B: {
      turn: { order: TurnOrder.RESET },
    },
  },
};
```

### Ad Hoc

You can also specify the next player during the `endTurn` event.
The `endTurn` event takes an additional argument that may specify
the next player:

```js
endTurn({ next: playerID });
```

This argument can also be the return value of `turn.endIf` and
works the same way.

Player `3` is made the new player in both the following examples:

```js
onClickEndTurn() {
  this.props.events.endTurn({ next: '3' });
}
```

```js
const game = {
  turn: {
    endIf: (G, ctx) => ({ next: '3' }),
  },
};
```

### Creating a Custom Turn Order

```js
order: {
  // OPTIONAL:
  // Override the initial value of playOrder.
  // This is called at the beginning of the phase.
  playOrder: (G, ctx) => [...],

  // Get the initial value of playOrderPos.
  // This is called at the beginning of the phase.
  first: (G, ctx) => 0,

  // Get the next value of playOrderPos.
  // This is called at the end of each turn.
  // The phase ends if this returns undefined.
  next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
}
```
