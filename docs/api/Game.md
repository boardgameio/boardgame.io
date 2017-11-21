# Game

```js
Game({
  // Initial value of G.
  G: {},

  // Game moves.
  moves: {
    'moveName': moveFn,
    ...
  }
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

  - `G` (*object*): The initial value of G.
  - `moves` (*object*): The keys are move names, and the values
    are pure functions that return the new value of `G` once
    the move has been processed.

### Returns

(`game`): An object that contains
1. `G`: The initial value of G.
2. `moveNames`: The names of the moves of the game.
3. `reducer`: The reducer to maintain `G`.

### Usage

```js
import Game from 'boardgame.io/game';

var game = Game({
  G: {},
  
  moves: {
    'moveWithoutArgs': function(G, ctx) {
      return Object.assign({}, G, ...);
    },

    'moveWithArgs': function(G, ctx, arg0, arg1) {
      return Object.assign({}, G, ...);
    }
  }
});
```

ES2015 version

```js
import Game from 'boardgame.io/game';

const game = Game({
  G: {},
  
  moves: {
    moveWithoutArgs(G, ctx) {
      return {...G, ...};
    },

    moveWithArgs(G, ctx, arg0, arg1) {
      return {...G, ...}
    }
  }
});
```
