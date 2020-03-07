# Plugins

The Plugin API allows you to provide off-the-shelf objects
that add custom functionality to [boardgame.io](https://boardgame.io/).
You can create wrappers around moves, provide custom interfaces
in `G` and much more.

#### Creating a Plugin

A plugin is an object that contains the following fields.
All fields are optional and typically accept the `game`
object as a parameter.

```js
{
  // Function that accepts a move / trigger function
  // and returns another function that wraps it. This
  // wrapper can modify G before passing it down to
  // the wrapped function. It is a good practice to
  // undo the change at the end of the call. You can
  // also use the more convenient preMove / postMove
  // hooks below if all you desire is to preprocess
  // and postprocess G.
  fnWrap: (fn, game) => (G, ctx, ...args) => {
    G = preprocess(G);
    G = fn(G, ctx, ...args);
    G = postprocess(G);
    return G;
  },

  // Called right before a move in order to preprocess G.
  beforeMove: G => G,

  // Called right before an event in order to preprocess G.
  beforeEvent: G => G,

  // Called right after an event in order to postprocess G.
  afterMove: G => G,

  // Called right after a move in order to postprocess G.
  afterEvent: G => G,

  setup: {
    // Called during setup in order to add state to G.
    G: (G, ctx, game) => G,
        // Called during setup in order to add state to ctx.
    ctx: (ctx, game) => ctx
  }
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

The initial values of these states are determined by the `playerSetup` function, which creates the state for a particular `playerID`.

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
