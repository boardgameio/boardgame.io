# Client

Creates a `boardgame.io` client. This is the entry point for
the client application.

### Arguments

1. obj(_object_): A config object with the options shown below under 'Usage'.

### Returns

(`client`): A React component that runs the client.

The component supports the following `props`:

1. `gameID`: Connect to a particular game (multiplayer).

2. `playerID`: Associate the client with a player (multiplayer).

3. `debug`: Set to `false` to disable the Debug UI.

### Usage

```js
import { Client } from 'boardgame.io/react';

const App = Client({
  // The return value of Game().
  game: game,

  // The number of players.
  numPlayers: 2,

  // Your React component representing the game board.
  // The props that this component receives are listed below.
  board: Board,

  // Set to true to enable sending move updates to the
  // server via WebSockets. Can also be set to
  // { server: 'hostname:port' }
  // to specify a socket server that's different from
  // the one that served up the page.
  multiplayer: false,

  // Set to false to disable the Debug UI.
  debug: true,

  // An optional Redux store enhancer.
  // This is useful for augmenting the Redux store
  // for purposes of debugging or simply intercepting
  // events in order to kick off other side-effects in
  // response to moves.
  enhancer: applyMiddleware(your_middleware),
});

ReactDOM.render(<App />, document.getElementById('app'));
```

The `Board` component will receive the following as `props`:

1. `G`: The game state.

2. `ctx`: The game metadata.

3. `moves`: An object containing functions to dispatch various
   moves that you have defined. The functions are named after the
   moves you created using [Game()](/api/Game.md). Each function
   can take any number of arguments, and they are passed to the
   move function after `G` and `ctx`.

4. `events`: An object containing functions to dispatch various
   game events like `endTurn` and `endPhase`.

5. `log`: The game log.

6. `gameID`: The game ID associated with the client.

7. `playerID`: The player ID associated with the client.

8. `isActive`: `true` if the client is able to currently make
   a move or interact with the game.

9. `isMultiplayer`: `true` if it is a multiplayer game.

10. `isConnected`: `true` if connection to the server is active.

11. `isSynced`: `true` if the initial sync with the server is done.
