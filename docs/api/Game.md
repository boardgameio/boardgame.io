# Game

Creates a new game implementation described by the initial
game state and the moves. The moves are converted to a
[Redux](http://redux.js.org/docs/basics/Reducers.html) reducer to maintain `G`.

### Arguments

1. `obj` (*object*): An object that contains

  - `setup` (*object*): Function that returns the initial value of G.
  - `moves` (*object*): The keys are move names, and the values
    are pure functions that return the new value of `G` once
    the move has been processed.
  - `playerView` (*function*): Returns a version of `G` that
    is customized for a given player. See [Secret State](/secret-state) for more information.
  - `flow` (*object*): Arguments to customize the flow of the game. See
    [Phases](/phases) for more information.
  - `flow.endGameIf` (*function*): *(G, ctx) => {}*
     The game automatically ends if this function returns anything (checked after each move).
     The return value is available at `ctx.gameover`.
  - `flow.endTurnIf` (*function*): *(G, ctx) => boolean*
     The turn automatically ends if this function returns true (checked after each move).
  - `flow.phases` (*array*): Optional list of game phases. See
    [Phases](/phases) for more information.

### Returns

(`game`): An object that contains
1. `setup`: The same `setup` from the input object.
2. `moveNames`: The names of the moves of the game.
3. `processMove`: The reducer to maintain `G`.
4. `playerView`: The passed in `playerView` function.
5. `flow`: An object derived from `obj.flow` containing a reducer to maintain `ctx`.

### Usage

```js
import { Game } from 'boardgame.io/core';

const game = Game({
  // Initial value of G.
  setup: (numPlayers) => {
    const G = {...};
    return G;
  },

  // Game moves.
  moves: {
    moveWithoutArgs(G, ctx) {
      return {...G, ...};
    },

    moveWithArgs(G, ctx, arg0, arg1) {
      return {...G, ...}
    }
  },

  flow: {
    endGameIf: (G, ctx) => {
      if (IsWinner(G, ctx.currentPlayer)) {
        return ctx.currentPlayer;
      }
    },
  },

  // View of game state which hides private information (e.g. face-down cards).
  playerView: (G, ctx, player) => {
    return SecretsRemoved(G, ctx.currentPlayer);
  },

});
```
