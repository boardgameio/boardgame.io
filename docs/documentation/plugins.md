# Plugins

The Plugin API allows you to create objects that expose
custom functionality to [boardgame.io](https://boardgame.io/).
You can create wrappers around moves, add API's to `ctx` etc.

### Creating a Plugin

A plugin is an object that contains the following fields.

```js
{
  // Required.
  name: 'plugin-name',

  // Initialize the plugin's data.
  // This is stored in a special area of the state object
  // and not exposed to the move functions.
  setup: ({ G, ctx, game }) => data object,

  // Create an object that becomes available in `ctx`
  // under `ctx['plugin-name']`.
  // This is called at the beginning of a move or event.
  // This object will be held in memory until flush (below)
  // is called.
  api: ({ G, ctx, game, data, playerID }) => api object,

  // Return an updated version of data that is persisted
  // in the game's state object.
  flush: ({ G, ctx, game, data, api }) => data object,

  // Function that accepts a move / trigger function
  // and returns another function that wraps it. This
  // wrapper can modify G before passing it down to
  // the wrapped function. It is a good practice to
  // undo the change at the end of the call. 
  // `fnType` gives the type of hook being wrapped
  // and will be one of the `GameMethod` values —
  // import { GameMethod } from 'boardgame.io/core' 
  fnWrap: (fn, fnType) => ({ G, ...rest }, ...args) => {
    G = preprocess(G);
    G = fn({ G, ...rest }, ...args);
    G = postprocess(G);
    return G;
  },

  // Function that allows the plugin to indicate that it
  // should not be run on the client. If it returns true,
  // the client will discard the state update and wait
  // for the master instead.
  noClient: ({ G, ctx, game, data, api }) => boolean,

  // Function that allows the plugin to indicate that the
  // current action should be declared invalid and cancelled.
  // If `isInvalid` returns an error message, the whole update
  // will be abandoned and an error returned to the client.
  isInvalid: ({ G, ctx, game, data, api }) => false | string,

  // Function that can filter `data` to hide secret state
  // before sending it to a specific client.
  // `playerID` could also be null or undefined for spectators.
  playerView: ({ G, ctx, game, data, playerID }) => filtered data object,
}
```

### Adding Plugins to Games

The list of plugins is specified in the game spec.

```js
import { PluginA, PluginB } from 'boardgame.io/plugins';

const game = {
  name: 'my-game',

  plugins: [PluginA, PluginB],

  // ...
};
```

?> Plugins are applied one after the other in the order
that they are specified (from left to right).

### Configuring Plugins

Some plugins may need a user to provide some configuration. The recommended way to do that is to design the plugin as a factory function that takes configuration as its arguments and returns a plugin object.

```js
import { ConfigurablePlugin } from './plugins';

const game = {
  name: 'my-game',
  plugins: [
    ConfigurablePlugin(options),
  ],
}
```

?> See `PluginPlayer` below for an example of this in practice.

### Available Plugins

#### PluginPlayer

```js
import { PluginPlayer } from 'boardgame.io/plugins';

// define a function to initialize each player’s state
const playerSetup = (playerID) => ({ ... });

// filter data returned to each client to hide secret state (OPTIONAL)
const playerView = (players, playerID) => ({
  [playerID]: players[playerID],
});

const game = {
  plugins: [
    // pass your function to the player plugin
    PluginPlayer({
      setup: playerSetup,
      playerView: playerView,
    }),
  ],
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

The initial values of these states are determined by the `setup` function in its options object, which creates the state for a particular `playerID`.

The record associated with the current player can be accessed
via `ctx.player.get()`. If this is a 2 player game,
then the opponent's record is available using `ctx.player.opponent.get()`. These fields can be modified using their corresponding
`set()` versions.

```js
ctx.player.get() // Get the current player's record.
ctx.player.set() // Update the current player's record.
ctx.player.opponent.get() // Get the opponent player's record.
ctx.player.opponent.set() // Update the opponent player's record.
```
