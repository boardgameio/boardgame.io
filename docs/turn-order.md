# Turn Orders

When the turn ends (either by calling `endTurn` manually
or if the `endTurnIf` condition triggers), then the
turn is passed to the "next" player. The default behavior
is to pass the turn around in a round-robin fashion.

The framework maintains the turn order state using the
following fields:

```
ctx: {
  currentPlayer: '0',
  actionPlayers: ['0'],
  playOrder: ['0', '1', '2', ...],
  playOrderPos: 0,
}
```

##### currentPlayer

This is the owner of the current turn, and the only
player that can call events (`endTurn`, `endPhase` etc.).

##### actionPlayers

This is the set of players that can currently
make a move. It defaults to a list containing just the
`currentPlayer`, but you might want to change it in order
to support actions from other players during the currrent turn
(for example, if you play a card that forces everyone else
to discard a card). See the [Events](events.md) page for
documentation on how to do this. Note that if this list
contains multiple playerID's, they can make a move in any
order.

!> The player that just made a move is available at
`ctx.playerID` in case you need to differentiate between
multiple players that could simultaneously move.

##### playOrderPos

An index into `playOrder`. It is the value that is updated
by the turn order policy in order to compute `currentPlayer`.
The default behavior is to just increment it in a round-robin
fashion. `currentPlayer` is just `playOrder[playOrderPos]`.

##### playOrder

The default value is `['0', '1', ... ]`. It provides a level
of indirection so that you can modify the turn order from
within your game logic.

### Available turn orders

##### DEFAULT

This is the default round-robin. It is used if you don't
specify any turn order. It goes on indefinitely until you
end the phase, at which point the next phase's turn order
kicks in. Note that if the next phase also uses
`TurnOrder.DEFAULT`, the turn order will continue passing
around in a round-robin seamlessly.

##### ONCE

This is another round-robin, but it goes around only once.
After this, the phase ends automatically.

##### ANY

This turn order passes the turn around in a round-robin.
However, `actionPlayers` is set to all players at each turn.
This allows anybody to make a move. Common applications of
this are to create phases where you want to elicit a response
from all players in the game. The round-robin feature of this
turn order is not useful in such cases.

### Specifying a turn order

You can change the turn order by using the `turnOrder` option.
This is passed inside a `flow` section of the `Game` configuration:

```js
import { Game, TurnOrder } from 'boardgame.io/core';

Game({
  moves: {
    ...
  },

  flow: {
    turnOrder: TurnOrder.ANY,
  }
}
```

Turn orders can also be specified on a per-phase level.

```js
import { Game, TurnOrder } from 'boardgame.io/core';

Game({
  moves: {
    ...
  },

  flow: {
    phases: [
      {
        name: 'A',
        turnOrder: TurnOrder.ANY,
      },
      {
        name: 'B',
        turnOrder: TurnOrder.ONCE,
      },
    ],
  }
}
```

### Implementing a custom turn order

A `TurnOrder` object has the following structure:

```js
{
  // Get the initial value of playOrderPos,
  first: (G, ctx) => 0,

  // Get the next value of playOrderPos when endTurn is called.
  next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
}
```

!> The phase ends if `next()` returns `undefined`.

The implementation above shows the default round-robin order that
repeats indefinitely. If you want to skip over every other player (for example), do something like this:

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

You may also set `actionPlayers` from a `TurnOrder` object by
returning an object of type:

```js
{
  playOrderPos, actionPlayers;
}
```

```js
{
  // Get the initial value of playOrderPos,
  first: (G, ctx) => { playOrderPos: 0, actionPlayers: ['0'] }

  // Get the next value of playOrderPos when endTurn is called.
  next: (G, ctx) => {
    const playOrderPos = (ctx.playOrderPos + 1) % ctx.numPlayers;
    const actionPlayers = ['0', '1'];
    return { playOrderPos, actionPlayers };
}
```

### endTurn / endTurnIf

You can also specify the next player during the `endTurn` event.
The `endTurn` event takes an additional argument specifying
the next player. If `endTurnIf` returns a string that is a playerID,
that player is made the next player (instead of following the turn
order).

Player '3' is made the new player in both the following examples:

```js
onClickEndTurn() {
  this.props.endTurn('3');
}
```

```js
flow: {
  endTurnIf: (G, ctx) => '3',
}
```
