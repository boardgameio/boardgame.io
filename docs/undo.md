# Undo / Redo

The framework comes with built-in support to undo / redo
moves in the current turn. This is a common pattern in
games that allow a player to make multiple moves per turn,
and can be a useful feature to allow the player to experiment
with different move combinations (and seeing what they do)
before committing to one.

#### Usage

You can use the `undo` and `redo` functions in a similar
manner like `reset`:

```
onClickUndoButton() {
  this.props.undo();
}

onClickRedoButton() {
  this.props.redo();
}
```

##### Restricting Undoable Moves

In case you just want specific moves to be undoable,
for example to prevent peeking at cards or rerolling of
dices, you can instead add `undoableMoves` to your `flow`
section similar to `allowedMoves` in `phases`:

```js
Game({
  moves: {
    rollDice: (G, ctx) => ...
    playCard: (G, ctx) => ...
  },

  flow: {
    undoableMoves: ['playCard'],
  }
});
```

This way only `playCard` will be undoable, but not `rollDice`.
If this is set to an empty list, no move will be undoable.

!> This setting is overridable on a per-phase basis like
most other settings in `flow`.
