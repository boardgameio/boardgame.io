# Client

Creates a `boardgame.io` client. This is the entry point for
the client application.

<!-- tabs:start -->

### **Plain JS**

#### Import

```js
import { Client } from 'boardgame.io/client';
```

### Creating a client

#### Arguments

1. `options` (_object_): An object with the following options:

```js
const client = Client({
  // A game definition object.
  game: game,

  // The number of players.
  numPlayers: 2,

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

  // Match to connect to (multiplayer).
  matchID: 'matchID',

  // Associate the client with a player (multiplayer).
  playerID: 'playerID',

  // The player’s authentication credentials (multiplayer).
  credentials: 'credentials',

  // Set to false to disable the Debug Panel
  debug: true/false,

  // Add a Redux enhancer to the internal store.
  // See “Debugging” guide for more details
  enhancer: enhancer,
});
```

### Using a client

#### Properties

The following properties are available on a client instance:

- `moves`: An object containing functions to dispatch the
   moves that you have defined. The functions are named after the
   moves you created in your [game object](/api/Game.md). Each function
   can take any number of arguments, and they are passed to the
   move function after `G` and `ctx`.


- `events`: An object containing functions to dispatch various
   game events like `endTurn` and `endPhase`.


- `log`: The game log.


- `matchID`: The match ID associated with the client.


- `playerID`: The player ID associated with the client.


- `credentials`: Multiplayer authentication credentials for this player.


- `matchData`: An array containing the players that have joined
  the current match via the [Lobby API](/api/Lobby.md).

  Example:

  ```js
  [
    { id: 0, name: 'Alice' },
    { id: 1, name: 'Bob' }
  ]
  ```


#### Methods

The following methods are available on a client instance:

- `start()`: Start running the client. Connects to the multiplayer
  transport and creates the Debug Panel.


- `stop()`: Stop running the client. Disconnects the multiplayer
  transport and unmounts the Debug Panel.


- `getState()`: Get the current game state. Returns `null` if the client
  still needs to sync with a remote master, otherwise an object:

  ```js
  {
    // The game state object `G`.
    G: { /* ... */ },

    // The game `ctx` (turn, currentPlayer, etc.)
    ctx: { /* ... */ },

    // State for plugins.
    plugins: { /* ... */ },

    // The game log.
    log: [ /* ... */ ],

    // `true` if the client is able to currently make
    // a move or interact with the game.
    isActive: true/false,

    // `true` if connection to the server is active.
    isConnected: true/false,
  }
  ```


- `subscribe(callback)`: Add a callback for every state change.
  The passed function will be called with the same value as returned by
  `getState`. `subscribe` returns an unsubscribe function.

  ```js
  const unsubscribe = client.subscribe(state => {
    // use updated state
  });

  // unsubscribe from the client
  unsubscribe();
  ```


- `reset()`: Function that resets the game.


- `undo()`: Function that undoes the last move.


- `redo()`: Function that redoes the previously undone move.


- `updateMatchID(id)`: Function to update the client’s match ID.


- `updatePlayerID(id)`: Function to update the client’s player ID.


- `updateCredentials(credentials)`: Function to update the client’s credentials.


### **React**

#### Import

```js
import { Client } from 'boardgame.io/react';
```

#### Arguments

1. `options` (_object_): An object with the options shown below under ‘Usage’.

#### Returns

A React component that runs the client.

The component supports the following `props`:

1. `matchID` (_string_):
   Connect to a particular match (multiplayer).

2. `playerID` (_string_):
   Associate the client with a player (multiplayer).

3. `credentials` (_string_):
   The player’s authentication credentials (multiplayer).

4. `debug` (_boolean_):
   Set to `false` to disable the Debug UI.

### Usage

```js
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

#### Board Props

The component you pass as the `board` option will receive the
following as `props`:

- `G`: The game state.


- `ctx`: The game metadata.


- `moves`: An object containing functions to dispatch various
   moves that you have defined. The functions are named after the
   moves you created in your [game object](/api/Game.md). Each function
   can take any number of arguments, and they are passed to the
   move function after `G` and `ctx`.


- `events`: An object containing functions to dispatch various
   game events like `endTurn` and `endPhase`.


- `reset`: Function that resets the game.


- `undo`: Function that undoes the last move.


- `redo`: Function that redoes the previously undone move.


- `log`: The game log.


- `matchID`: The match ID associated with the client.


- `playerID`: The player ID associated with the client.


- `matchData`: An array containing the players that have joined
  the current match via the [Lobby API](/api/Lobby.md).

    Example:

    ```js
    [
      { id: 0, name: 'Alice' },
      { id: 1, name: 'Bob' }
    ]
    ```


- `isActive`: `true` if the client is able to currently make
    a move or interact with the game.


- `isMultiplayer`: `true` if it is a multiplayer game.


- `isConnected`: `true` if connection to the server is active.


- `credentials`: Authentication token for this player when using
    the [Lobby REST API](/api/Lobby.md#server-side-api).

<!-- tabs:end -->
