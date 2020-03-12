# Plugins

The Plugin API allows you to create objects that expose
custom functionality to [boardgame.io](https://boardgame.io/).
You can create wrappers around moves, add API's to `ctx` etc.

#### Creating a Plugin

A plugin is an object that contains the following fields.

```js
{
  // Required.
  name: 'plugin-name',

  // Initialize the plugin's data.
  // This is stored in a special area of the state object
  // and not exposed to the move functions.
  setup: ({ ctx }) => object,

  // Create an object that becomes available in `ctx`
  // under `ctx['plugin-name']`.
  // This is called at the beginning of a move or event.
  // This object will be held in memory until flush (below)
  // is called.
  api: ({ G, ctx, data }) => object,

  // Return an updated version of data that is persisted
  // in the game's state object.
  flush: ({ G, ctx, data, api }) => object,

  // Function that accepts a move / trigger function
  // and returns another function that wraps it. This
  // wrapper can modify G before passing it down to
  // the wrapped function. It is a good practice to
  // undo the change at the end of the call.
  fnWrap: (fn, game) => (G, ctx, ...args) => {
    G = preprocess(G);
    G = fn(G, ctx, ...args);
    G = postprocess(G);
    return G;
  },
}
```

#### Adding Plugins to Games

The list of plugins is specified in the game spec.

```js
import { PluginA, PluginB } from 'boardgame.io/plugins';

const game = {
  name: 'my-game',

  moves: {
    ...
  },

  plugins: [PluginA, PluginB],
};
```

!> Plugins are applied one after the other in the order
that they are specified (from left to right).

#### Available Plugins

**PluginPlayer**

```js
import { PluginPlayer } from 'boardgame.io/plugins';

const game = {
  playerSetup: (playerID) => ({ ... }),
  plugins: [PluginPlayer],
};
```

`PluginPlayer` makes it easy to manage player state.
It creates an object `players` that
stores state for individual players.  This object is
stored in the plugin's private storage area:

```
players: {
  '0': { ... },
  '1': { ... },
  '2': { ... },
  ...
}
```

The initial values of these states are determined by the `playerSetup` function, which creates the state for a particular `playerID`.

The record associated with the current player can be accessed
via `ctx.player.get()`. If this is a 2 player game,
then the opponent's record is available using `ctx.player.opponent.get()`. These fields can be modified using their corresponding
`set()` versions.

```
ctx.player.get() - Get the current player's record.
ctx.player.set() - Update the current player's record.
ctx.player.opponent.get() - Get the opponent player's record.
ctx.player.opponent.set() - Update the opponent player's record.
```
