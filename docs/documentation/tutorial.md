# Tutorial

This tutorial walks through a simple game of Tic-Tac-Toe.

[node]: https://nodejs.dev/learn/how-to-install-nodejs
[cmd]: https://tutorial.djangogirls.org/en/intro_to_command_line/
[vsc]: https://code.visualstudio.com/
[atom]: https://atom.io/



## Setup

Clone the boardgame.io template repository from https://github.com/info-hsaka/boardgame-template .
(See here for an instruction on how to do that: https://js.oc.is/docs/intro/setup/#34-clone-git-repository)
Run `npm i` in that folder. (For detailed instructions see here: https://js.oc.is/docs/intro/setup/#35-weitere-programme-installieren)

As with the JS tutorial, you should be able to click on the "Run" button to start the game. (See https://js.oc.is/docs/intro/howto/ for a refresher on that)
You should be able to see a website on http://localhost:3000.

## Defining a Game

We define a game by creating an object whose contents
tell boardgame.io how your game works. More or less everything
is optional, so we can start simple and gradually add complexity.
In the Template most functions are already defined but not filed out. So you can fill in the relevant parts.

To start, we’ll fill the `setup` function in the file `src/Game.js`, which will set the
initial value of the game state `G`. 
And an `moves` object containing the moves that make up the game.

A move is a function that updates `G` to the desired new state.
It receives an object containing various fields
as its first argument. This object includes the game state `G` and
`ctx` — an object managed by boardgame.io that contains game metadata.
It also includes `playerID`, which identifies the player making the move.
After the object containing `G` and `ctx`, moves can receive arbitrary arguments
that you pass in when making the move. (see the example functions included in the file)

In Tic-Tac-Toe, we only have one type of move and we will
name it `clickCell`. It will take the ID of the cell that was clicked
and update that cell with the ID of the player who clicked it.

Let’s put this together in our `src/Game.js` file to start
defining our game:

```js
export const TicTacToe = {
  setup: () => ({ cells: Array(9).fill(null) }),

  moves: {
    clickCell: ({ G, playerID }, id) => {
      G.cells[id] = playerID;
    },
  },
};
```

?> The `setup` function also receives an object as its first argument
like moves. This is useful if you need to customize the initial
state based on some field in `ctx` — the number of players, for example —
but we don't need that for Tic-Tac-Toe.



```
npm start
```

Although we haven’t built any UI yet, boardgame.io renders a Debug Panel.
This panel means we can already play our Tic-Tac-Toe game!

You can make a move by clicking on `clickCell` on the
Debug Panel, entering a number between `0` and `8`, and pressing
**Enter**. The current player will make a move on the chosen
cell. The number you enter is the `id` passed to the `clickCell` function as
the first argument after `G` and `ctx`. Notice how the
`cells` array on the Debug Panel updates as you make moves. You
can end the turn by clicking `endTurn` and pressing **Enter**. The next call to
`clickCell` will result in a “1” in the chosen cell instead of a “0”.

```react
<iframe class='react' src='snippets/example-1' height='760' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```


?> You can turn off the Debug Panel by passing `debug: false`
in the `Client` config.


## Game Improvements

### Validating Moves

So far, if a player calls `clickCell` for a cell that is already filled,
it will be overwritten. Let’s prevent that by updating `clickCell`
to let us know that a move is invalid if the selected cell isn’t `null`.

Moves can let the framework know they are invalid by returning a
special constant which we import into `src/Game.js`:

```js
import { INVALID_MOVE } from 'boardgame.io/core';
```

Now we can return `INVALID_MOVE` from `clickCell`:

```js
clickCell: ({ G, playerID }, id) => {
  if (G.cells[id] !== null) {
    return INVALID_MOVE;
  }
  G.cells[id] = playerID;
}
```

### Managing Turns

In the Debug Panel we clicked `endTurn` to pass the turn
to the next player after making a move. We could do this from our
client code too: make a move, then end the turn. This could be flexible
because a player could choose when to end their turn, but in
Tic-Tac-Toe we know that the turn should always end when a move is made.

There are several different ways to manage turns in boardgame.io.
We’ll use the `maxMoves` option in our game definition to tell
the framework to automatically end a player’s turn after a single
move has been made, as well as the `minMoves` option, so players
*have* to make a move and can't just `endTurn`.

```js
export const TicTacToe = {
  setup: () => { /* ... */ },

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },

  moves: { /* ... */ },
}
```

?> You can learn more in the [Turn Order](turn-order.md)
    and [Events](events.md) guides.

### Victory Condition

The Tic-Tac-Toe game we have so far doesn't really ever end.
Let's keep track of a winner in case one player wins the game.

First, let’s declare two helper functions in `src/Game.js`
to test the `cells` array with:

```js
// Return true if `cells` is in a winning configuration.
function isVictory(cells) {
  const positions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
    [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
  ];

  const isRowComplete = row => {
    const symbols = row.map(i => cells[i]);
    return symbols.every(i => i !== null && i === symbols[0]);
  };

  return positions.map(isRowComplete).some(i => i === true);
}

// Return true if all `cells` are occupied.
function isDraw(cells) {
  return cells.filter(c => c === null).length === 0;
}
```

Now, we add an `endIf` method to our game.
This method will be called each time our state updates to
check if the game is over.

```js
export const TicTacToe = {
  // setup, moves, etc.

  endIf: ({ G, ctx }) => {
    if (isVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (isDraw(G.cells)) {
      return { draw: true };
    }
  },
};
```

?> `endIf` takes a function that determines if
the game is over. If it returns anything at all, the game ends and
the return value is available at `ctx.gameover`. In order for bots (see below) to work properly, the return value should be an object with a `winner` key if there is a winner. See the example above.



## Building a Board

We now only need to draw out board to play the game.
We will cover how to draw this yourself in a later tutorial, for now we will use the code below in the `src/App.js` file.



```js
class GameClient {
  createBoard() {
    // Create cells in rows for the Tic-Tac-Toe board.
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const cells = [];
      for (let j = 0; j < 3; j++) {
        const id = 3 * i + j;
        cells.push(`<td class="cell" data-id="${id}"></td>`);
      }
      rows.push(`<tr>${cells.join('')}</tr>`);
    }

    // Add the HTML to our app <div>.
    // We’ll use the empty <p> to display the game winner later.
    this.rootElement.innerHTML = `
      <table>${rows.join('')}</table>
      <p class="winner"></p>
    `;
  }

  attachListeners() {
    // This event handler will read the cell id from a cell’s
    // `data-id` attribute and make the `clickCell` move.
    const handleCellClick = event => {
      const id = parseInt(event.target.dataset.id);
      this.client.moves.clickCell(id);
    };
    // Attach the event listener to each of the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.onclick = handleCellClick;
    });
  }
}

const appElement = document.getElementById('app');
const app = new TicTacToeClient(appElement);
```

You probably won’t see anything just yet, because all the cells are empty.
Let’s fix that by adding a style for the cells to `index.html` (below the `<meta />`: 

```html
<style>
  .cell {
    border: 1px solid #555;
    width: 50px;
    height: 50px;
    line-height: 50px;
    text-align: center;
  }
</style>
```

Now you should see an empty Tic-Tac-Toe board!
But there’s still one thing missing. If you click
on the board cells, you should see `G.cells` update
in the Debug Panel, but the board itself doesn’t change.
We need to add a way to refresh the board every time
boardgame.io’s state changes.

Let’s do that by writing an `update` method for our `GameClient`
class and subscribing to the boardgame.io state:

```js
class GameClient {
  constructor() {
    // As before, but we also subscribe to the client:
    this.client.subscribe(state => this.update(state));
  }

  createBoard() { /* ... */ }

  attachListeners() { /* ... */ }

  update(state) {
    // Get all the board cells.
    const cells = this.rootElement.querySelectorAll('.cell');
    // Update cells to display the values in game state.
    cells.forEach(cell => {
      const cellId = parseInt(cell.dataset.id);
      const cellValue = state.G.cells[cellId];
      cell.textContent = cellValue !== null ? cellValue : '';
    });
    // Get the gameover message element.
    const messageEl = this.rootElement.querySelector('.winner');
    // Update the element to show a winner if any.
    if (state.ctx.gameover) {
      messageEl.textContent =
        state.ctx.gameover.winner !== undefined
          ? 'Winner: ' + state.ctx.gameover.winner
          : 'Draw!';
    } else {
      messageEl.textContent = '';
    }
  }
}
```

Here are the key things to remember:

- You can trigger the moves defined in your game definition
  by calling `client.moves['moveName']`.


- You can register callbacks for every state change using `client.subscribe`.

And there you have it. A basic tic-tac-toe game!

```react
<iframe class='react' src='snippets/example-2' height='760' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

?> You can press <kbd>1</kbd> (or click on the button next to “reset”)
   to reset the state of the game and start over.



## Bots

In this section we will show you how to add a bot that is
capable of playing your game. We need to tell the
bot what moves are allowed in the game, and it will find moves that
tend to produce winning results.

To do this, add an `ai` section to the game definition.
The `enumerate` function should return an array of possible
moves, so in our case it returns a `clickCell` move for every
empty cell.

```js
export const TicTacToe = {
  // setup, turn, moves, endIf ...

  ai: {
    enumerate: (G, ctx) => {
      let moves = [];
      for (let i = 0; i < 9; i++) {
        if (G.cells[i] === null) {
          moves.push({ move: 'clickCell', args: [i] });
        }
      }
      return moves;
    },
  },
};
```

That's it! Now that you can visit the AI section of the Debug Panel:

- `play` causes the bot to calculate and make a single move
  (shortcut: <kbd>2</kbd>)

- `simulate` causes the bot to play the entire game by itself
  (shortcut: <kbd>3</kbd>)

`play` helps you combine moves that you make yourself
and bot moves. For example, you can make
some manual moves to get two in a row and then verify that
the bot makes a block.

```react
<iframe class='react' src='snippets/example-3' height='760' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

?> The bot uses [MCTS](https://nicolodavis.com/blog/tic-tac-toe/) under the
hood to explore the game tree and find good moves. The default uses
1000 iterations per move.  This can be configured to adjust the
bot's playing strength.
