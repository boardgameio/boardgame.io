# Turn Order

The framework maintains the turn order using the following fields:

```
ctx: {
  actionPlayers: ['0'],
  currentPlayer: '0',
  playOrder: ['0', '1', '2', ...],
  playOrderPos: 0,
}
```

`currentPlayer` is basically the owner of the current turn.

`actionPlayers` are the set of players that can currently
make a move. It defaults to a list containing just the
`currentPlayer`, but you might want to change it in order
to support actions from other players during the currrent turn
(for example, if you play a card that forces everyone else
to discard a card).

`playOrderPos` is an index into `playOrder` and the way in which it
is updated is determined by a particular `TurnOrder`. The default
behavior is to just increment it in a round-robin fashion.
`currentPlayer` is just `playerOrder[playOrderPos]`.

If you need something different, you have a few options:

#### turnOrder

You can customize this behavior by using the `turnOrder` option.
This is passed inside a `flow` section of the `Game` configuration.
The framework comes bundled with a few turn orders in the `TurnOrder`
object, and you can even provide your own implementation.

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

#### endTurn / endTurnIf

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
