# Tutorial

The goal of this tutorial is to make a simple TicTacToe game using boardgame.io. 
You'll learn the basic concepts of boardgame.io and how to use them and in the end you'll have a working game.

[node]: https://nodejs.dev/learn/how-to-install-nodejs
[cmd]: https://tutorial.djangogirls.org/en/intro_to_command_line/
[vsc]: https://code.visualstudio.com/
[atom]: https://atom.io/



## Setup

Clone the boardgame.io template repository from https://github.com/info-hsaka/boardgame-template .
(See here for instructions on how to do that: https://js.oc.is/docs/intro/setup/#34-clone-git-repository)
Like before we need to install some additional programs by running `npm i` in the folder. Take a look here for more detailed (and Windows!) instructions:  https://js.oc.is/docs/intro/setup/#35-weitere-programme-installieren

As with the JS tutorial, you should be able to click on the "Run" button to start the game. (See https://js.oc.is/docs/intro/howto/ for a refresher on that)
You should be able to see a website by navigating your browser to http://localhost:3000/

Once you have cloned the template repository, this tutorial will work in the src/TicTacToe.js file. You can look at the other files in the src folder, but you don't need to change them for this tutorial. The src/Game.js file includes a game object with a few more functions added to it, so you  can get a sense for what will be possible later on. For now we will focus on the TicTacToe object in the TicTacToe.js file.

## Defining a Game

We define a game by creating an object which contains information about your game to
tell boardgame.io how it works. More or less everything
is optional, so we can start simple and gradually add more complexity.
In the template most functions are already defined but not filled out, which means you'll have to fill in the relevant parts.

To start, we’ll fill the `setup` function in the file `src/Game.js`, which will set the
initial value of the game state `G`. 

?> The game state `G` is a plain JavaScript object that represents the state of the game as we talked about during the in-person session. If, at any point, you have questions about parts of boardgame.io or other concepts that we use here, feel free to ask and also look around at the rest of the documentation here.

```js
export const TicTacToe = {
  // Fill the cells of the TicTacToe board with `null` to indicate that they are empty.
  // This is the initial state of the game.
  // This syntax might be new, but we're just defining a function in a JavaScript object.
  // The function will be available in the `setup` field of the `TicTacToe` object and would
  // be called like this: `TicTacToe.setup()`. However we don't need to call it ourselves, boardgame.io will do that for us.
  setup: function setup() {
    return { cells: [null, null, null, null, null, null, null, null, null] }
  }
};
```

Next up is the `moves` object.

A move is a function that takes some input (like the cell a player clicked on) and updates `G` to the desired new state.
"Moves" represent things a player can do in the game. In TicTacToe it's pretty simple: a player can click on a cell to place their mark there.

The `moves` object is a collection of all possible moves with their names as a normal JavaScript object:

```js
export const TicTacToe = {
  // I won't repeat everything in the object, just new parts that were added
  // ...

  moves: {
    clickCell: () => {
      console.log("A clickCell move was made!")
    },
  },
}
```

Move functions take an argument that contains a few fields, most importantly `G` and `playerID`. `G` is the game state object that we set up with the `setup` function and `playerID` is the ID (short for identifier, in our case 0 or 1) of the player who made the move. The second argument can be anything else we need to pass to make a valid move. We will see later how to use that. In this case, we need to know in which cell the player would like to place their X/O, so we add a second argument `cellIndex` to the `clickCell` function.

```js
export const TicTacToe = {
  // ...

  moves: {
    clickCell: function clickCell(move, cellIndex) {
      console.log("Player number " + move.playerID + " wants to place their mark in cell " + cellIndex)
    },
  },
}
```

Now to update the game state, we simply update G in our move function:

```js
export const TicTacToe = {
  // ...

  moves: {
    clickCell: function clickCell(move, cellIndex) {
      // cells is the array we setup in the setup function and we simply assign the playerID to the cellIndex
      // to indicate which player has placed their mark there.
      move.G.cells[cellIndex] = move.playerID;
    },
  },
}
```

?> The `setup` function also receives an object as its first argument
like moves. This is useful if you need to customize the initial
state based on some field in `ctx` — the number of players, for example —
but we don't need that for Tic-Tac-Toe.

At this point your TicTacToe.js file should look like this:

```js
export const TicTacToe = {
  setup: function setup() {
    return { cells: [null, null, null, null, null, null, null, null, null] }
  },

  moves: {
    clickCell: function clickCell(move, cellIndex) {
      // cells is the array we setup in the setup function and we simply assign the playerID to the cellIndex
      // to indicate which player has placed their mark there.
      move.G.cells[cellIndex] = move.playerID;
    },
  },
}
```

You can now click the "Run" button to see the game in action. Go to http://localhost:3000/ to see the game.

At this point you should see an empty TicTacToe board and the boardgame.io Debug Panel.
This panel means we can already play our Tic-Tac-Toe game!

You can make a move by clicking on `clickCell` on the
Debug Panel, entering a number between `0` and `8` in the (), and pressing
**Enter**. The current player will make a move on the chosen
cell. The number you enter is the `id` passed to the `clickCell` function as
the first argument after `move`. Notice how the
`cells` array on the Debug Panel updates as you make moves. You
can end the turn by clicking `endTurn` and pressing **Enter**. The next call to
`clickCell` will result in a “1” in the chosen cell instead of a “0”.

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
import { INVALID_MOVE } from 'boardgame.io/core';

export const TicTacToe = {
  // ...

  moves: {
    clickCell: function clickCell(move, cellIndex) {
      if (move.G.cells[cellIndex] !== null) {
        return INVALID_MOVE;
      }
      move.G.cells[cellIndex] = move.playerID;
    },
  },
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
  setup: // ...
  moves: { /* ... */ },

  turn: {
    minMoves: 1,
    maxMoves: 1,
  },
}
```

Try playing around with the game in the debug panel again. You should see that you can't make a move in a cell that is already filled and that the turn automatically ends after a move is made.

?> You can learn more in the [Turn Order](turn-order.md)
    and [Events](events.md) guides.

### Victory Condition

The Tic-Tac-Toe game we have so far doesn't really ever end.
Let's keep track of a winner in case one player wins the game.

In order to do that, first we need to know if a player won and if so, which one.

TicTacToe will often end in a draw, so we need to handle that as well. We can add a helper function to check if the game is over, i.e. all cells are filled.

```js
function isDraw(cells) {
  // Return `true` if all cells are filled and `false` otherwise
}
```

Write the code for this function as described and we will see later how to use it.

The other problem we have is finding out if someone has won the game. In Tic-Tac-Toe, a player wins if they have three of their marks in a row, either horizontally, vertically, or diagonally. We should write a helper function to check if a player has won:

```js
function isVictory(cells) {
  // Return the playerID of the winner if there is one, otherwise `null`
}
```

Hints: cells is an array with exactly 9 elements and each element is either `null`, `0`, or `1`. Imagine the elements of the arary being laid out like this:

```
0 | 1 | 2
3 | 4 | 5
6 | 7 | 8
```

And then write a function that checks for a win in each row, column, and diagonal.

Now that we have these functions, we add an `endIf` method to our game.
This method will be called each time our state updates to
check if the game is over.

```js
export const TicTacToe = {
  // setup, moves, etc.

  endIf: function endIf(endIf) {
    const winner = isVictory(endIf.G.cells);
    if (winner != null) {
      // our isVictory function returned a playerID so the game is over and we have a winner
      return { winner: winner };
    }
    // if there is no winner, check if the game is a draw
    if (isDraw(endIf.G.cells)) {
      // the game is a draw, so we tell boardgame.io that result
      return { draw: true };
    }
  },
};
```

?> `endIf` takes a function that determines if
the game is over. If it returns anything at all, the game ends and
the return value is available at `ctx.gameover`. In order for bots (see below) to work properly, the return value should be an object with a `winner` key if there is a winner. See the example above.

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
    enumerate: function enumerate(G)  {
      // this function returns the top left cell as the only possible move every time
      // Modify this function so that it will return all possible TicTacToe moves to make the
      // bot actually play the game based on `G.cells`.
      // Think about what moves are possible in TicTacToe and how you can find them in our cells array.
      return [{ move: 'clickCell', args: [0] }];
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

?> The bot uses [MCTS](https://nicolodavis.com/blog/tic-tac-toe/) under the
hood to explore the game tree and find good moves. The default uses
1000 iterations per move.  This can be configured to adjust the
bot's playing strength.

## Further Reading and what's next

Feel free to play around more with TicTacToe and try to think about other games and how they would map to the concepts you learned.

In a future tutorial you will also learn how to actually draw the UI yourself, how to make it look nice and how to respond to user input.

Feel free to look around in the other files in the template, but don't worry if you don't understand everything yet. The tutorial template uses concepts that we won't even need during the HSAKA (such as HTML and CSS), because we will be using a different technology to draw the UI.

If you feel like you understand everything that's going on in the TicTacToe file, that's more than enough.

