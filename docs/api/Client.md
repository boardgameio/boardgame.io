# Client

```js
Client({
  // The return value of Game().
  game: game,

  // The number of players.
  numPlayers: 2,

  // The React component representing your game board.
  board: Board,

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

The `Board` component will receive the following as `props`:

1. `G`: The game state.

2. `ctx`: The game metadata.

3. `moves`: An object containing functions to dispatch various
moves that you have defined. The functions are named after the
moves you created using [Game()](/api/Game.md). Each function
can take any number of arguments, and they are passed to the
move function after `G` and `ctx`.

4. `endTurn`: A function that ends the turn.

5. `playerID`: The player ID associated with the client.

6. `isActive`: `true` if the client is able to currently make
a move or interact with the game.


### Arguments
1. obj(*object*): A config object with the options shown above.

### Returns
(`client`): A React component that runs the app.

The component supports the following `props`:

1. `gameID`: Connect to a particular game (multiplayer).

2. `playerID`: Associate the client with a player (multiplayer).

3. `debug`: Set to `false` to disable the Debug UI.

### Usage

```js
import Client from 'boardgame.io/client';

const App = Client({
  ...
});

ReactDOM.render(<App/>, document.getElementById('app'));
```

The returned element can also take an optional `gameID`
argument when used in multiplayer mode to connect to a
specific game (as opposed to the default one).

```
<App gameID="my-game-id" />
```
