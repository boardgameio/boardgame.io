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

  // Optional: React component to display while the client
  // is in the "loading" state prior to the initial sync
  // with the game master. Relevant only in multiplayer mode.
  // If this is not provided, the client displays "connecting...".
  loading: LoadingComponent,

  // Can be set to one of the following in order to enable multiplayer:
  //
  // 1. true
  //
  // This starts sending move updates to the server via socket.io.
  //
  // 2. { server: 'hostname:port' }
  //
  // Same as the above, but also specifies the server location.
  //
  // 3. { local: true}
  //
  // Special local mode that uses an in-memory game master. Useful
  // for testing multiplayer interactions locally without having to
  // connect to a server.
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

5. `reset`: Function that resets the game.

6. `undo`: Function that undoes the last move.

7. `redo`: Function that redoes the previously undone move.

8. `log`: The game log.

9. `gameID`: The game ID associated with the client.

10. `playerID`: The player ID associated with the client.

11. `isActive`: `true` if the client is able to currently make
    a move or interact with the game.

12. `isMultiplayer`: `true` if it is a multiplayer game.

13. `isConnected`: `true` if connection to the server is active.
