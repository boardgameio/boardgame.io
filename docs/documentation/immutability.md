# Immutability

The principle of immutability as applied to state changing
functions like moves in [boardgame.io](https://boardgame.io/)
mandates that they be pure functions. What this means is that
you cannot depend on any **external state**, nor can you have any
**side-effects**, i.e. you cannot modify anything that isn't
a local variable (not even the arguments).

The benefits of architecting a system with this principle are
that you can ensure repeatability (moves can be replayed
over a particular state value multiple times in different places)
and you can do cheap comparisons to check if something changed.

A traditional pure function just accepts arguments and then
returns the new state. Something like this:

```js
function move({ G }) {
  // Return new value of G without modifying the arguments.
  return { ...G, hand: G.hand + 1 };
}
```

?> The example above uses the
[spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) to create a new object.

[boardgame.io](https://boardgame.io/) provides a more convenient
syntax by allowing you to mutate `G` directly while using
a [library](https://github.com/mweststrate/immer) under the hood
to convert your move into a pure function that respects the
immutability principle. Both styles are supported interchangeably,
so use the one that you prefer.

```js
function move({ G }) {
  G.hand++;
}
```

?> Note that in this style you do not return the new state.
In fact, returning something while also mutating `G` is
considered an error.

!> You can only modify `G`. Other values passed to your moves
   are read-only and should never be modified in either style.
   Changes to `ctx` can be made using [events](events.md).

### Invalid moves

In both styles, invalid moves are indicated by returning a
special constant. This tells the framework that the current
set of arguments passed in is illegal and that the move
ought to be discarded. For example, you might do this if
the user tries to click on an already filled cell in
Tic-Tac-Toe.

```js
import { INVALID_MOVE } from 'boardgame.io/core';

moves: {
  clickCell: function({ G, ctx }, id) {
    // Illegal move: Cell is filled.
    if (G.cells[id] !== null) {
      return INVALID_MOVE;
    }

    // Fill cell with 0 or 1 depending on the current player.
    G.cells[id] = ctx.currentPlayer;
  }
}
```

### Additional Reading

[Immutable Update Patterns](https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns)
