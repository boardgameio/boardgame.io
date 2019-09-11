# Turn Orders

When the turn ends (either by calling `endTurn` manually
or if the `turn.endIf` condition triggers), then the
turn is passed to the "next" player. The default behavior
is to pass the turn around in a round-robin fashion.

The framework maintains the turn order state using the
following fields:

```
ctx: {
  currentPlayer: '0',
  activePlayers: { '0': null },
  playOrder: ['0', '1', '2', ...],
  playOrderPos: 0,
}
```

##### `currentPlayer`

This is the owner of the current turn, and the only
player that can call events (`endTurn`, `endPhase` etc.).

##### `activePlayers`

This is a map of players that can currently make a move and their
current “stage”. By default, `activePlayers` is not used and only
the `currentPlayer` can make a move. You can use `activePlayers`
to support actions from other players during the currrent turn
(for example, if you play a card that forces everyone else
to discard a card). Note that if `activePlayers` contains multiple
players, they can make a move in any order.

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

### Default `turn.order` configurations

**boardgame.io** provides some default turn order
configurations for common patterns.

```js
import { TurnOrder } from 'boardgame.io/core';
```

You can then use these in your turn configuration:

```js
turn: {
  order: TurnOrder.DEFAULT;
}
```

##### `DEFAULT`

This is the default round-robin. It is used if you don't
specify any turn order. It goes on indefinitely until you
end the phase, at which point the next phase's turn order
kicks in. Note that if the next phase also uses
`DEFAULT`, the turn order will continue passing
around in a round-robin seamlessly.

##### `RESET`

This is similar to `DEFAULT`, but instead of continuing
from the previous position at the beginning of a phase, it
will always start from `0`.

##### `ONCE`

This is another round-robin, but it goes around only once.
After this, the phase ends automatically.

##### `CUSTOM`

Round-robin like `DEFAULT`, but sets `playOrder` to the provided
value.

##### `CUSTOM_FROM`

Round-robin like `DEFAULT`, but sets `playOrder` to the value
in a specified field in `G`.

### Default `activePlayers` configurations

**boardgame.io** also provides some default configurations
for `activePlayers` for common patterns.

```js
import { ActivePlayers } from 'boardgame.io/core';
```

You can then use these in your turn configuration:

```js
turn: {
  activePlayers: ActivePlayers.ALL;
}
```

##### `ALL`

`activePlayers` is set to include all players while the turn stays
fixed with one player. This allows every player in the game
to make a move (in any order) during the current player’s turn.

##### `ALL_ONCE`

Similar to `ALL`, but allows each player to make exactly
one move. Once all players have made their move, the turn will
return to the current player.

##### `OTHERS`

Similar to `ALL`, but excludes the current player from the set
of action players.

##### `OTHERS_ONCE`

Similar to `OTHERS`, but allows each player to make exactly one
move. When all (other) players have made their move, the current
player can move again. This is typically used in a phase where you
would like to elicit a response from every other player in the
game. For example, you might have a card which (when played)
requires every other player in the game to discard a card.

### Interactive demos

```react
<iframe class='react' src='react/turn-order/turn-order.html' height='1050' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

### Specifying a turn order

You can change the turn order by using the `turn.order` option.
This can be passed inside your game configuration:

```js
import { TurnOrder, ActivePlayers } from 'boardgame.io/core';

export const game = {
  turn: {
    order: TurnOrder.DEFAULT,
    activePlayers: ActivePlayers.ALL,
  },
};
```

Turn orders can also be specified on a per-phase level.

```js
import { TurnOrder, ActivePlayers } from 'boardgame.io/core';

export const game = {
  phases: {
    A: {
      turn: { activePlayers: ActivePlayers.ALL },
    },
    B: {
      turn: { order: TurnOrder.ONCE },
    },
  },
};
```

### Implementing a custom turn order

The following settings inside `turn` affect turn order:

```js
const turn = {
  // OPTIONAL:
  // If this section is present, it will override the DEFAULT
  // turn order.
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
  },

  // OPTIONAL:
  // If this section is present, activePlayers is modified
  // at the beginning of the phase.
  activePlayers: {
    // Sets activePlayers to the provided map.
    value: {
      '0': 'myStage',
      '1': Stage.NULL
    },

    // Makes all players active with the passed value.
    all: true,

    // Makes all players except currentPlayer active with the passed value.
    others: true,

    // Makes the current player active with the passed value.
    currentPlayer: true,

    // Limits the number of moves each active player can make.
    // When the limit is reached, the player is removed from
    // activePlayers. Once every player in activePlayers has
    // reached the limit, activePlayers is set to null.
    moveLimit: 2,

    // A next option will be used once activePlayers becomes empty
    // (either by using moveLimit or manually removing players).
    // All options available inside activePlayers are available
    // inside next.
    next: {
      currentPlayer: true
    },
  },
}
```

### `endTurn` / `turn.endIf`

You can also specify the next player during the `endTurn` event.
The `endTurn` event takes an additional argument that may specify
the next player:

```js
endTurn({ next: playerID });
```

This argument can also be the return value of `turn.endIf` and works the same way.

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
