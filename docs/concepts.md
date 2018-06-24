# Concepts

The framework captures the game state in two objects: `G` and
`ctx`.

### State

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

These are pure functions that tell the framework how to change `G`
when a particular game move is made.

```js
moves: {
  'moveA': function(G, ctx) {
    // Clone G.
    const Gcopy = { ...G };

    // Update copy.
    // ...

    // Return copy.
    return Gcopy;
  },

  'moveB': function(G, ctx) {
    // Clone G.
    const Gcopy = { ...G };

    // Update copy.
    // ...

    // Return copy.
    return Gcopy;
  },

  ...
}
```

!> A move can also return `undefined` (or not return),
which indicates that the move (or its combination of arguments)
is invalid at this point in the game and shouldn't update the
game state.

!> A pure function does not mutate its arguments, nor does
it depend on any external state or have any side-effects. Calling
it multiple times on the same input values should produce
the same result. See the guide on [Immutability](immutability.md) for
more details.

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
