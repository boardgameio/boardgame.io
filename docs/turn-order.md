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
to discard a card). Note that if this list contains multiple
playerID's, they can make a move in any order.

##### playOrder

The default value is `['0', '1', ... ]`. You can think of this
as the order in which players sit down at the table. A round
robin turn order would move `currentPlayer` through this
list in order.

##### playOrderPos

An index into `playOrder`. It is the value that is updated
by the turn order policy in order to compute `currentPlayer`.
The default behavior is to just increment it in a round-robin
fashion. `currentPlayer` is just `playOrder[playOrderPos]`.

!> The player that just made a move is available at
`ctx.playerID` in case you need to differentiate between
multiple players that could simultaneously move.

### Available turn orders

##### DEFAULT

This is the default round-robin. It is used if you don't
specify any turn order. It goes on indefinitely until you
end the phase, at which point the next phase's turn order
kicks in. Note that if the next phase also uses
`DEFAULT`, the turn order will continue passing
around in a round-robin seamlessly.

##### ONCE

This is another round-robin, but it goes around only once.
After this, the phase ends automatically.

##### ANY

`actionPlayers` is set to all players while the turn stays
fixed with one player. This allows every player in the game
to make a move (in any order).

##### ANY_ONCE

Similar to the above, but allows each player to make exactly
one move. Also, the phase ends when all players have made their
move.

##### OTHERS

Similar to `ANY`, but excludes the current player from the set
of action players.

##### OTHERS_ONCE

Similar to the above, but allows each player to make exactly
one move. Also, the phase ends when all (other) players have
made their move. This is typically used in a phase where you
would like to elicit a response from every other player in the
game. For example, you might have a card which (when player)
requires every other player in the game to discard a card.

### Interactive demos

```react
<iframe class='react' src='react/turn-order/turn-order.html' height='1050' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

### Specifying a turn order

You can change the turn order by using the `turnOrder` option.
This is passed inside a `flow` section of the `Game` configuration:

```js
import { Game, TurnOrder } from 'boardgame.io/core';

Game({
  flow: {
    turnOrder: TurnOrder.ANY,
  }
}
```

Turn orders can also be specified on a per-phase level.

```js
import { Game, TurnOrder } from 'boardgame.io/core';

Game({
  flow: {
    phases: {
      A: { turnOrder: TurnOrder.ANY },
      B: { turnOrder: TurnOrder.ONCE },
    },
  }
}
```

### Implementing a custom turn order

A `TurnOrder` object has the following structure:

```js
{
  // Get the initial value of playOrderPos.
  // This is called at the beginning of the phase.
  first: (G, ctx) => 0,

  // Get the next value of playOrderPos.
  // This is called at the end of each turn.
  // The phase ends if this returns undefined.
  next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,

  // OPTIONAL:
  // If this section is present, actionPlayers is modified
  // at the beginning of the phase.
  actionPlayers: {
    // Sets actionPlayers to the array specified.
    values: [...],

    // Sets actionPlayers to all players.
    all: true,

    // Sets actionPlayers to all players except currentPlayer.
    others: true,

    // Each time an action player makes a move, they are
    // removed from actionPlayers. Once every player in
    // actionPlayers has made a move, the phase ends.
    once: true,
  },
}
```

### endTurn / endTurnIf

You can also specify the next player during the `endTurn` event.
The `endTurn` event takes an additional argument that may specify
the next player:

```js
endTurn({ next: playerID });
```

This argument can also be the return value of `endTurnIf` and works the same way.

Player `3` is made the new player in both the following examples:

```js
onClickEndTurn() {
  this.props.events.endTurn({ next: '3' });
}
```

```js
flow: {
  endTurnIf: (G, ctx) => ({ next: '3' }),
}
```
