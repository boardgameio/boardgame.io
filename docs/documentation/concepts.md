# Concepts

### State

The framework captures the game state in two objects: `G` and
`ctx`.

```js
{
  // The game state (user-managed).
  G: {},

  // Read-only metadata managed by the framework.
  ctx: {
    turn: 0,
    currentPlayer: '0',
    numPlayers: 2
  }
}
```

These state objects are passed around everywhere and maintained
on both client and server seamlessly. The state in `ctx` is
incrementally adoptable, meaning that you can manage all the
state manually in `G` if you so desire.

!> `ctx` contains other fields not shown here that complex games
can take advantage of, including support for game phases and complex
turn orders.

### Moves

These are functions that tell the framework how to change `G`
when a particular game move is made. They must not depend on
external state or have any side-effects (except modifying `G`).
See the guide on [Immutability](immutability.md) for how
immutability is handled by the framework.

```js
moves: {
  drawCard: function(G, ctx) {
    const card = G.deck.pop();
    G.hand.push(card);
  },

  ...
}
```

Moves are dispatched from the client in different ways
depending on the platform you are developing on. If you
are using React, for example, they are dispatched via an API
provided through `props`.

```js
onClick() {
  this.props.moves.moveA();
}
```

### Events

These are functions provided by the framework in order to change state
in `ctx`. These typically advance the game state by doing things like
ending the turn, changing the game phase etc.
Events are dispatched from the client in a similar way to moves. Here
is an example in React again:

```js
onClick() {
  this.props.events.endTurn();
}
```

For more details, see the guide on [Events](events.md).

### Turn

A turn is a period of the game that is associated with a single
player. It typically consists of a set of moves made by
that player before it passes on to another player. You can
also allow other players to play during your turn, although
this is less common. See the guide on
[Turn Orders](turn-order.md) for more details.

### Phase

A phase is a label that is associated with a particular
game configuration. A phase can be configured with a
custom turn order, enable a certain subset of moves and
much more. The game can transition between different phases
just like the turn can be passed between different players.
These happen independently (i.e. you can design your game
to have multiple phases per turn or multiple turns per phase).
See the guide on [Phases](phases.md) for more details.
