# Tutorial

This tutorial walks through a simple game of Tic-Tac-Toe.

?> We’re going to be running commands from a terminal and using Node.js/npm.
   If you haven’t done that before, you might want to read [an introduction to the command line][cmd]
   and follow [the instructions on how to install Node][node]. You’ll also want
   a text editor to write code in like [VS Code][vsc] or [Atom][atom].

[node]: https://nodejs.dev/learn/how-to-install-nodejs
[cmd]: https://tutorial.djangogirls.org/en/intro_to_command_line/
[vsc]: https://code.visualstudio.com/
[atom]: https://atom.io/



## Setup

We’re going to use ES2015 features like module [imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
and the [object spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator)
syntax, so we’ll need to use some kind of build system to compile
our code for the browser.

This tutorial shows two different approaches: one using [React](https://reactjs.org/),
the other using basic browser APIs and compiling our app with
[Parcel](https://parceljs.org/).
You can follow whichever you feel most comfortable with.

<!-- tabs:start -->

### **Plain JS**

Let’s create a new Node project from the command line:

```
mkdir bgio-tutorial
cd bgio-tutorial
npm init --yes
```

?> These commands will make a new directory called `bgio-tutorial`,
   change to that directory, and initialise a new Node package.
   [Read more in the Node Package Manager docs.][pkgjson]

[pkgjson]: https://docs.npmjs.com/creating-a-package-json-file#creating-a-default-packagejson-file

We’re going to add boardgame.io and also Parcel to help us build our app:

```
npm install boardgame.io
npm install --save-dev parcel
```


Now, let’s create the basic structure our project needs:


1. A JavaScript file for our web app at `src/App.js`.


2. A JavaScript file for our game definition at `src/Game.js`.


3. A basic HTML page that will load our app at `index.html`:

    ```html
    <!DOCTYPE html>
    <html>
    <head>
      <title>boardgame.io Tutorial</title>
      <meta charset="utf-8" />
    </head>
    <body>
      <div id="app"></div>
      <script src="./src/App.js"></script>
    </body>
    </html>
    ```

Your project directory should now look like this:

    bgio-tutorial/
    ├── index.html
    ├── node_modules/
    ├── package-lock.json
    ├── package.json
    └── src/
        ├── App.js
        └── Game.js

Looking good? OK, let’s get started! 🚀

?> You can check out the complete code for this tutorial
and play around with it on CodeSandbox:<br/><br/>
[![Edit bgio-plain-js-tutorial](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/bgio-plain-js-tutorial-ewyyt?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.js&theme=dark)

### **React**

We’ll use the [create-react-app](https://create-react-app.dev/)
command line tool to initialize our React app and then add boardgame.io to it.

```
npx create-react-app bgio-tutorial
cd bgio-tutorial
npm install boardgame.io
```

While we’re here, let’s also create an empty JavaScript file for our game code:

```
touch src/Game.js
```

?> You can check out the complete code for this tutorial
and play around with it on CodeSandbox:<br/><br/>
[![Edit boardgame.io](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/boardgameio-wlvi2)

<!-- tabs:end -->



## Defining a Game

We define a game by creating an object whose contents
tell boardgame.io how your game works. More or less everything
is optional, so we can start simple and gradually add complexity.
To start, we’ll add a `setup` function, which will set the
initial value of the game state `G`, and a `moves` object
containing the moves that make up the game.

A move is a function that updates `G` to the desired new state.
It receives an object containing various fields
as its first argument. This object includes the game state `G` and
`ctx` — an object managed by boardgame.io that contains game metadata.
It also includes `playerID`, which identifies the player making the move.
After the object containing `G` and `ctx`, moves can receive arbitrary arguments
that you pass in when making the move.

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



## Creating a Client

<!-- tabs:start -->

### **Plain JS**

We’ll start by creating a class to manage our web app’s logic in `src/App.js`.

In the class’s constructor we’ll create a boardgame.io client
and call its `start` method to run it.

```js
import { Client } from 'boardgame.io/client';
import { TicTacToe } from './Game';

class TicTacToeClient {
  constructor() {
    this.client = Client({ game: TicTacToe });
    this.client.start();
  }
}

const app = new TicTacToeClient();
```

Let’s also add a script to `package.json` to make serving the web app simpler
and a [browserslist string](https://github.com/browserslist/browserslist) to
indicate the browsers we want to support:

```json
{
  "scripts": {
    "start": "parcel index.html --open"
  },
  "browserslist": "defaults and supports async-functions"
}
```
?> By dropping support for browsers that don’t support async functions, we don’t
   need to worry about including the `regenerator-runtime` polyfill. If you need to
   support older browsers, you can skip adding `browserslist`, but may need to
   include the polyfill manually.

You can now serve the app from the command line by running:

```
npm start
```

### **React**

Replace the contents of `src/App.js` with

```js
import { Client } from 'boardgame.io/react';
import { TicTacToe } from './Game';

const App = Client({ game: TicTacToe });

export default App;
```

You can now serve the app from the command line by running:

```
npm start
```

<!-- tabs:end -->

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
function IsVictory(cells) {
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
function IsDraw(cells) {
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
    if (IsVictory(G.cells)) {
      return { winner: ctx.currentPlayer };
    }
    if (IsDraw(G.cells)) {
      return { draw: true };
    }
  },
};
```

?> `endIf` takes a function that determines if
the game is over. If it returns anything at all, the game ends and
the return value is available at `ctx.gameover`.



## Building a Board

<!-- tabs:start -->

### **Plain JS**

You can build your game board with your preferred UI tools.
This example will use basic JavaScript, but you should be able
to adapt this approach to many other frameworks.

To start with, let’s add a `createBoard` method to our
`TicTacToeClient` and call it in the constructor. This will inject
the required DOM structure for our board into the web page.
To know where to insert our board UI, we’ll pass in an
element when instantiating the class.

We’ll also add an `attachListeners` method. This will
set up our board cells so that they trigger the `clickCell`
move when they are clicked.

```js
class TicTacToeClient {
  constructor(rootElement) {
    this.client = Client({ game: TicTacToe });
    this.client.start();
    this.rootElement = rootElement;
    this.createBoard();
    this.attachListeners();
  }

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
Let’s fix that by adding a style for the cells to `index.html`:

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

Let’s do that by writing an `update` method for our `TicTacToeClient`
class and subscribing to the boardgame.io state:

```js
class TicTacToeClient {
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

### **React**

React can be a good fit for board games because
it provides a declarative API to translate objects
to UI elements. To create a board we need to translate
the game state `G` into actual cells that are clickable.

Let’s create a new file at `src/Board.js`:

```js
import React from 'react';

export function TicTacToeBoard({ ctx, G, moves }) {
  const onClick = (id) => moves.clickCell(id);

  let winner = '';
  if (ctx.gameover) {
    winner =
      ctx.gameover.winner !== undefined ? (
        <div id="winner">Winner: {ctx.gameover.winner}</div>
      ) : (
        <div id="winner">Draw!</div>
      );
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
        <td key={id}>
          {G.cells[id] ? (
            <div style={cellStyle}>{G.cells[id]}</div>
          ) : (
            <button style={cellStyle} onClick={() => onClick(id)} />
          )}
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
```

The important bit to pay attention to is about how to
dispatch moves. We have the following code in our click
handler:

```js
moves.clickCell(id);
```

- `moves` is passed in your component’s props by the framework and
  contains functions to dispatch your game’s moves. `props.moves.clickCell`
  dispatches the `clickCell` move, and any data passed in is made
  available in the move handler.


Now, we pass the board component to our `Client` in `src/App.js`:

```js
import { TicTacToeBoard } from './Board';

const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
});

export default App;
```

<!-- tabs:end -->

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

The framework will come bundled with a few different bot algorithms, and an advanced
version of MCTS that will allow you to specify a set of objectives to optimize for.
For example, at any given point in the game you can tell the bot to gather resources
in the short term and wage wars in the late stages. You just tell the bot what to do
and it will figure out the right combination of moves to make it happen!

Detailed documentation about all this is coming soon. Adding bots to games for actual
networked play (as opposed to merely simulating moves) is also in the works.
