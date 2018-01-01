# Tutorial

This tutorial walks through a simple game of Tic-Tac-Toe.

## Setup

We shall use [create-react-app](https://github.com/facebookincubator/create-react-app) to create a **React** app and add
**boardgame.io** features. The code uses ES2015 features,
including [imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), and
the [object spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator) syntax.

```
$ npm install -g create-react-app
$ create-react-app game
$ cd game
$ npm install --save boardgame.io
```

## Define moves

We create the game by providing the initial value of the
game state `G` (through the `setup` function), and the moves
of the game. The `setup` function also accepts a
`numPlayers` parameter if you need to customize the initial
state based on the number of players, but we don't need that
for Tic-Tac-Toe.

In Tic-Tac-Toe, we have just one type of move that we shall
name `clickCell`. The move function accepts
the game state `G` and returns the new game state
after the move is executed. `ctx` is a framework managed
object that contains metadata like `turn` and `currentPlayer`.
Everything after that is an argument that you pass in at the
call-site of this move.

```js
// src/App.js

import Client from 'boardgame.io/client';
import Game from 'boardgame.io/game';

const TicTacToe = Game({
  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    clickCell(G, ctx, id) {
      let cells = [...G.cells];  // don't mutate original state.
      cells[id] = ctx.currentPlayer;
      return {...G, cells};      // don't mutate original state.
    }
  }
});

const App = Client({ game: TicTacToe });

export default App;
```

!> The move function must be pure, meaning that it must be
a repeatable calculation of state without any side effects.

!> The move function can receive any number of additional
arguments that are passed to it from the call-site.

Run the app using:
```
npm start
```

```react
<iframe class='react' src='react/example-1.html' height='800' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

Notice that we have a fully playable game that we can
interact with via the Debug UI with just
this little piece of code!

?> You can make a move by clicking on `clickCell` on the
Debug UI (or pressing the keyboard shortcut `c`),
entering `0` as an argument and pressing
`Enter` to have the current player make a move on the 0-th
cell. This `id` is available inside the move function as
the first argument after `G` and `ctx`. Notice how the
`cells` array now has a `0` in the 0-th position. You
can end the turn using `endTurn` and the next call to
`clickCell` will result in a `1` in the chosen cell.

!> The Debug UI can be turned off by passing `debug: false`
in the `Client` config.

## Add victory condition

The Tic-Tac-Toe game we have so far doesn't really terminate.
Let's keep track of a winner in case one player wins the game.
Let's also prevent players from being able to overwrite cells.

```js
function IsVictory(cells) {
  // Return true if `cells` is in a winning configuration.
}

const TicTacToe = Game({
  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    clickCell(G, ctx, id) {
      const cells = [...G.cells];

      // Ensure we can't overwrite cells.
      if (cells[id] === null) {
        cells[id] = ctx.currentPlayer;
      }

      return { ...G, cells };
    }
  },

  flow: {
    gameEndIf: (G, ctx) => {
      if (IsVictory(G.cells)) {
        return ctx.currentPlayer;
      }
    }
  }
});
```

!> The `gameEndIf` field takes a function that determines if
   the game is over. If it returns anything other than `undefined`
   the game ends, and the return value is available at `ctx.gameEnd`.

## Render board

**React** is a great fit for board games because
it provides a declarative API to translate objects
to UI elements.

Creating a board is a fairly mechanical process of
translating the game state `G` into actual cells that
are clickable.

```js
import React from 'react';

class TicTacToeBoard extends React.Component {
  onClick(id) {
    if (this.isActive(id)) {
      this.props.moves.clickCell(id);
      this.props.endTurn();
    }
  }

  isActive(id) {
    if (!this.props.isActive) return false;
    if (this.props.G.cells[id] !== null) return false;
    return true;
  }

  render() {
    let winner = '';
    if (this.props.ctx.gameEnd !== null) {
      winner = <div>Winner: {this.props.ctx.gameEnd}</div>;
    }

    const cellStyle = {
      border: '1px solid #555',
      width: '50px',
      height: '50px',
      lineHeight: '50px',
      textAlign: 'center',
    };

    let tbody = [];
    for (let i = 0; i < 3; i++) {
      let cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(
          <td style={cellStyle}
              key={id}
              onClick={() => this.onClick(id)}>
            {this.props.G.cells[id]}
          </td>
        );
      }
      tbody.push(<tr key={i}>{cells}</tr>);
    }

    return (
      <div>
        <table id="board">
        <tbody>{tbody}</tbody>
        </table>
        {winner}
      </div>
    );
  }
}
```

The important bit to pay attention to is about how to
dispatch moves. We have the following code in our click
handler:

```js
this.props.moves.clickCell(id);
this.props.endTurn();
```

`props.moves` is an object passed in by the framework that
contains functions to dispatch moves. `props.moves.clickCell`
dispatches the *clickCell* move, and any data passed in is made
available in the move handler.

!> The framework doesn't end the turn until `endTurn` is called.
This is to facilitate games where a player can take a number
of moves before the next player is allowed to play.

Now, we pass this component to our `Client` call.

```js
const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard
});

export default App;
```

And there you have it. A basic tic-tac-toe game!

```react
<iframe class='react' src='react/example-2.html' height='850' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

Editable version on CodePen: [link](https://codepen.io/nicolodavis/full/MEvrjq/)
