# Turn Order

The framework's default behavior is to pass the turn around
in a round-robin fashion. A player makes one or more moves
before triggering an `endTurn` event, which passes the turn
to the next player.

Turn order state is maintained in the following fields:

```js
ctx: {
  currentPlayer: '0',
  playOrder: ['0', '1', '2', ...],
  playOrderPos: 0,
}
```

##### `currentPlayer`

This is the owner of the current turn and the only player that
can normally make moves during the turn. You may also allow
additional players to make moves during the turn using [Stages](stages.md).

##### `playOrder`

The default value is `['0', '1', '2', ... ]`. You can think of this
as the order in which players sit down at the table. A round
robin turn order would move `currentPlayer` through this
list in order.

##### `playOrderPos`

An index into `playOrder`. It is the value that is updated
by the turn order policy in order to compute `currentPlayer`.
The default behavior is to just increment it in a round-robin
fashion. `currentPlayer` is just `playOrder[playOrderPos]`.

### Changing the Turn Order

Changing the game's turn order is accomplished by using the `order`
option inside the `turn` section of the game config:

```js
import { TurnOrder } from 'boardgame.io/core';

const game = {
  turn: {
    order: TurnOrder.ONCE,
  },
};
```

You will typically use one of the presets below. You may also
change the turn order at each phase of the game. See the guide
on [Phases](phases.md) for more details.

### Presets

#### DEFAULT

This is the default round-robin. It is used if you don't
specify any turn order.

#### RESET

This is similar to `DEFAULT`, but instead of incrementing
the previous position at the beginning of a phase, it
will always start from `0`.

#### CONTINUE

This is also similar to `DEFAULT`, but instead of incrementing
the previous position at the beginning of a phase, it will
start with the player who ended the previous phase.

#### ONCE

This is another round-robin, but it goes around only once.
After this, the phase ends automatically.

#### CUSTOM

Round-robin like `DEFAULT`, but sets `playOrder` to the provided
value.

```js
turn: {
  order: TurnOrder.CUSTOM(['1', '3']),
}
```

#### CUSTOM_FROM

Round-robin like `DEFAULT`, but sets `playOrder` to the value
in a specified field in `G`.

```js
turn: {
  order: TurnOrder.CUSTOM_FROM('property_in_G'),
}
```

### Ad Hoc

You can also specify the next player during the `endTurn` event.

```js
endTurn({ next: playerID });
```

This argument can also be the return value of `turn.endIf` and
works the same way.

Player `3` is made the new player in both examples below:

```js
function Move({ events }) {
  events.endTurn({ next: '3' });
}
```

```js
const game = {
  turn: {
    endIf: () => ({ next: '3' }),
  },
};
```

### Creating a Custom Turn Order

If the presets above aren't what you're looking for, you can
create a custom turn order from scratch:

```js
turn: {
  order: {
    // Get the initial value of playOrderPos.
    // This is called at the beginning of the phase.
    first: ({ G, ctx }) => 0,

    // Get the next value of playOrderPos.
    // This is called at the end of each turn.
    // The phase ends if this returns undefined.
    next: ({ G, ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers,

    // OPTIONAL:
    // Override the initial value of playOrder.
    // This is called at the beginning of the game / phase.
    playOrder: ({ G, ctx }) => [...],
  }
}
```
