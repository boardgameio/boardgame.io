# Undo / Redo

boardgame.io comes with built-in support to undo / redo
moves in the current turn. This is a common pattern in
games that allow a player to make multiple moves per turn,
and can be a useful feature to allow the player to experiment
with different move combinations (and seeing what they do)
before committing to one. You can disable this feature by
setting `disableUndo` to true in the game config.

### Usage

You can call the `undo` and `redo` functions from the client.

<!-- tabs:start -->
#### **Plain JS**

The methods are attached to a `Client` instance:

```js
client.undo();
client.redo();
```

#### **React**

The methods are passed in your board component’s `props`:

```js
props.undo();
props.redo();
```
<!-- tabs:end -->

### Restricting Undoable Moves

In case you just want specific moves to be undoable
(to prevent peeking at cards or rerolling of dice, for example),
you can use the long-form move syntax, which specifies the
move as an object rather than a function. The `undoable` bit
indicates whether the move can be undone:

```js
const game = {
  moves: {
    rollDice: {
      move: ({ G, ctx }) => {},
      undoable: false,
    },

    playCard: ({ G, ctx }) => {},
  },
};
```

In the example above, `playCard` will be undoable, but not `rollDice`.
