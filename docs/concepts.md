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
    currentPlayer: 0,
    numPlayers: 2
  }
}
```

These state objects are passed around everywhere, and maintained
on both client and server seamlessly. The state in `ctx` is
incrementally adoptable, meaning that you can manage all the
state manually in `G` if you so desire.

!> More features are being added to `ctx`, including support
for more complex game types involving phases etc.

### Moves

These tell the framework how you would like `G` to change
when a particular game move is made.

```js
Moves({
  'moveA': function(G, ctx) {
    // Clone G.
    const Gcopy = Object.assign({}, G);

    // mutate Gcopy in response to move.
    // ...

    // Return copy of G.
    return Gcopy;
  },

  'moveB': function(G, ctx) {
    // Clone G.
    const Gcopy = Object.assign({}, G);

    // mutate Gcopy in response to move.
    // ...

    // Return copy of G.
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
