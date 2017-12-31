# Game

```js
Game({
  // Initial value of G.
  setup: (numPlayers) => ({}),

  // Game moves.
  moves: {
    'moveName': moveFn,
    ...
  },

  flow: {
    // Determines the winner.
    victory: (G, ctx) => {
      return IsVictory(G) ? ctx.currentPlayer : null;
    },
  }

  // Customized view.
  playerView: (G, ctx, player) => {
    return G;
  },
}
```

Creates a new game implementation described by the initial
game state and the moves.

The moves are converted to a [Redux](http://redux.js.org/docs/basics/Reducers.html) reducer to maintain `G`. The reducer has the following signature:

```js
function(G, action, ctx) {
}
```

You can roll your own if you like, or use any Redux
addon to generate such a reducer.

The convention used in this framework is to
have `action.type` contain the name of the move, and
`action.args` contain any additional arguments as an
`Array`.

### Arguments

1. `obj` (*object*): An object that contains

  - `setup` (*object*): Function that returns the initial value of G.
  - `moves` (*object*): The keys are move names, and the values
    are pure functions that return the new value of `G` once
    the move has been processed.
  - `playerView` (*function*): Returns a version of `G` that
    is customized for a given player. See the document on
    [Secret State](/secret-state) for more information.
  - `flow` (*object*): Arguments to a `GameFlow`, to customize the flow of the game.

### Returns

(`game`): An object that contains
1. `G`: The initial value of G.
2. `moveNames`: The names of the moves of the game.
3. `reducer`: The reducer to maintain `G`.
4. `playerView`: The selector with the player view.
5. `flow`: The reducer to maintain `ctx`.

### Usage

```js
import Game from 'boardgame.io/game';

const game = Game({
  setup: (numPlayers) => {
    const G = {...};
    return G;
  },

  moves: {
    moveWithoutArgs(G, ctx) {
      return {...G, ...};
    },

    moveWithArgs(G, ctx, arg0, arg1) {
      return {...G, ...}
    }
  },

  flow: {
    victory: function(G, ctx)  {
      return IsWinner(G, ctx.currentPlayer) ? ctx.currentPlayer : null;
    }
  },

  playerView: (G, ctx) => {
    return SecretsRemoved(G, ctx.currentPlayer);
  },
});
```
