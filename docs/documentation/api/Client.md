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
  // A game object.
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

  // Set this to one of the following to enable multiplayer:
  //
  // SocketIO
  //   Implementation that talks to a remote server using socket.io.
  //
  //   How to import:
  //     import { SocketIO } from 'boardgame.io/multiplayer'
  //
  //   Arguments:
  //     Object with 2 parameters
  //        1. 'socketOpts' options to pass directly to socket.io client.
  //        2. 'server' specifies the server location in the format: [http[s]://]hostname[:port];
  //            defaults to current page host.
  //
  // Local
  //   Special local mode that uses an in-memory game master. Useful
  //   for testing multiplayer interactions locally without having to
  //   connect to a server.
  //
  //   How to import:
  //     import { Local } from 'boardgame.io/multiplayer'
  //
  // Additionally, you can write your own transport implementation.
  // See `src/client/client.js` for details.
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

8. `step`:
   Function that will advance the game if [AI is configured](/tutorial.md#bots).

9. `log`: The game log.

10. `gameID`: The game ID associated with the client.

11. `playerID`: The player ID associated with the client.

12. `gameMetadata`: An object containing the players that have joined
    the game from a [room](/api/Lobby.md).

    Example:

    ```json
    {
      "players": {
        "0": {
          "id": 0,
          "name": "Alice"
        },
        "1": {
          "id": 1,
          "name": "Bob"
        }
      }
    }
    ```

13. `isActive`: `true` if the client is able to currently make
    a move or interact with the game.

14. `isMultiplayer`: `true` if it is a multiplayer game.

15. `isConnected`: `true` if connection to the server is active.

16. `credentials`: Authentication token for this player when using
    the [Lobby REST API](/api/Lobby.md#server-side-api).
