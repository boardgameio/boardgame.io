# Concepts

The framework captures the game state in two objects: `G` and
`ctx`.

### State

```js
{
  // The board state (user-managed).
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
can take advantage of, including support for player passing and game phases.

### Moves

These tell the framework how you would like `G` to change
when a particular game move is made.

```js
Moves({
  'moveA': function(G, ctx) {
    // Clone G.
    const Gcopy = Object.assign({}, G);

    // Update copy.
    // ...

    // Return copy.
    return Gcopy;
  },

  'moveB': function(G, ctx) {
    // Clone G.
    const Gcopy = Object.assign({}, G);

    // Update copy.
    // ...

    // Return copy.
    return Gcopy;
  },

  ...
})
```

These moves are then dispatched from your React component
via an API provided through `props` in response to user
actions on the board.

```js
onClick() {
  this.props.moves.moveA();
}
```

!> A move can also return `undefined` (or not return),
which indicates that the move (or its combination of arguments)
is invalid at this point in the game and shouldn't update the
game state.
