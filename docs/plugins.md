# Plugins

The Plugin API allows you to create custom interfaces in
`G`. These can be small helpers or entire game systems that
target a genre of games.

#### Creating a Plugin

A plugin is an object that contains the following fields:

```js
{
  // Function that accepts a move / trigger function
  // and returns another function that wraps it. This
  // wrapper can modify G before passing it down to
  // the wrapped function. It is a good practice to
  // undo the change at the end of the call.
  wrapper: (fn) => (G, ctx, ...args) => {
    G = preprocess(G);
    G = fn(G, ctx, ...args);
    G = postprocess(G);
    return G;
  },

  // Optional.
  // Called during setup. The return value is merged
  // with the initial value of G. This is typically
  // used to store state that is managed by this
  setup: ctx => state,
}
```

#### Adding Plugins to Games

The list of plugins is specified in the game spec.

```js
import { PluginA, PluginB } from 'boardgame.io/plugins';

Game({
  name: 'my-game',

  moves: {
    ...
  },

  plugins: [PluginA, PluginB],
})
```

!> Plugins are applied one after the other in the order
that they are specified (from left to right).

#### Available Plugins

**PluginPlayer**

```js
import { PluginPlayer } from 'boardgame.io/plugins';

function PlayerState(playerID) {
  return { ... };
}

Game({
  plugins: [PluginPlayer(PlayerState)],
})
```

`PluginPlayer` makes it easy to manage player state.
It creates an object `G.players` that
stores state for individual players:

```
G: {
  players: {
    '0': { ... },
    '1': { ... },
    '2': { ... },
    ...
  }
}
```

The initial values of these states are determined by the parameter
`PlayerState`, which is a function that returns the state for a
particular `playerID`.

Before each move, the plugin makes the state associated with the
current player available at `G.player`. If this is a 2 player game,
then it also adds `G.opponent`. These fields can be modified and the
corresponding entries in `G.players` will be updated at the end of the move.

```
// The current player is '0'.

G: {
  player: { ... }  // copy of players['0']
  opponent: { ... }  // copy of players['1']

  players: {
    '0': { ... },
    '1': { ... },
  }
}
```
