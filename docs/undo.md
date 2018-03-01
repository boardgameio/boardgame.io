# Undo / Redo

The framework comes with built-in support to undo / redo
moves in the current turn. This is a common pattern in
games that allow a player to make multiple moves per turn,
and can be a useful feature to allow the player to experiment
with different move combinations (and seeing what they do)
before committing to one.

#### Usage

In order to activate this feature, all you need to do is
add `undo: true` to your `flow` section:

```js
Game({
  moves: {
    ...
  },

  flow: {
    undo: true
  }
});
```

This will enable two new events `undo` and `redo` that you
can dispatch in a manner similar to that used for `endTurn`.

```
onClickUndoButton() {
  this.props.events.undo();
}

onClickRedoButton() {
  this.props.events.undo();
}
```
