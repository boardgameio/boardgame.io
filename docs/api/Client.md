# Client

```js
Client({
  // The return value of Game().
  game: game,

  // The number of players.
  numPlayers: 2,

  // The React component representing your game board.
  board: Component,

  // Set to true to enable sending move updates to the
  // server via WebSockets.
  multiplayer: false,

  // Set to false to disable the Debug UI.
  debug: true
})
```

Creates a `boardgame.io` client. This is the entry point for
the client application, and is the only call necessary on the
client-side if you choose to roll your own move reducer.

### Arguments
1. obj(*object*): A config object with the options shown above.

### Returns
(`client`): A React component that can be used to render the app.

The component will receive as `props`:

1. `G`: The game state.

2. `ctx`: The game metadata.

3. `moves`: An object containing functions to dispatch various
moves that you have defined. The functions are named after the
moves you created using [Moves()](/api/Moves.md). Each function
can take any number of arguments, and they are passed to the
move function after `G` and `ctx`.

4. `endTurn`: A function that ends the turn.

### Usage

```js
import Client from 'boardgame.io/client';

const App = Client({
  ...
});

ReactDOM.render(<App/>, document.getElementById('app'));
```

The returned element can also take an optional `gameid`
argument when used in multiplayer mode to connect to a
specific game (as opposed to the default one).

```
<App gameid="my-game-id" />
```
