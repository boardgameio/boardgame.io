# Server

Creates a `boardgame.io` server. This is only required when
`multiplayer` is set to `true` on the client. It creates a
[Koa](http://koajs.com/) app that keeps track of the game
states of the various clients connected to it, and also
broadcasts updates to those clients so that all browsers
that are connected to the same game are kept in sync in
realtime.

The server also hosts a REST [API](https://boardgame.io/documentation/#/api/Lobby?id=server-side-api) that is used for creating
and joining games. This is hosted on the same port, but can
be configured to run on a separate port.

#### Arguments

A config object with the following options:

1. `games` (_array_): a list of game implementations
   (each should be an object conforming to the [Game API](/api/Game.md)).

2. `db` (_object_): the [database connector](/storage).
   If not provided, an in-memory implementation is used.

3. `transport` (_object_): the transport implementation.
   If not provided, socket.io is used.

4. `uuid` (_function_): an optional function that returns a unique identifier, used to create new game IDs and — if `generateCredentials` is not specified — player credentials. Defaults to [shortid](https://www.npmjs.com/package/shortid).

5. `generateCredentials` (_function_): an optional function that returns player credentials to store in the game metadata and validate against. If not specified, the `uuid` function will be used.

6. `authenticateCredentials` (_function_): an optional function that tests if a player’s move is made with the correct credentials when using the default socket.io transport implementation.

#### Returns

An object that contains:

1. `run` (_function_): A function to run the server.
    `(portOrConfig, callback) => ({ apiServer, appServer })`

2. `kill` (_function_): A function to stop the server.
    `({ apiServer, appServer }) => void`

3. `app` (_object_): The Koa app.

4. `db` (_object_): The database implementation.

5. `router` (_object_): The Koa Router for the server API.

### Usage

#### Basic

```js
const Server = require('boardgame.io/server').Server;

const server = Server({
  games: [game1, game2, ...],

  db: new DbConnector(),
});

server.run(8000);
```

#### With callback

```js
server.run(8000, () => console.log("server running..."));
```

#### With custom Lobby settings

You can pass `lobbyConfig` to configure the Lobby API during server startup:

```js
const lobbyConfig = {
  apiPort: 8080,
  apiCallback: () => console.log('Running Lobby API on port 8080...'),
};

server.run({ port: 8000, lobbyConfig });
```

Options are:

- `apiPort`: If specified, it runs the Lobby API in a separate Koa server on
this port. Otherwise, it shares the same Koa server running on the default
boardgame.io `port`.
- `apiCallback`: Called when the Koa server is ready. Only applicable if
`apiPort` is specified.

#### With HTTPS

```js
const { Server } = require('boardgame.io/server');
const fs = require('fs');

const server = Server({
  games: [game1, game2, ...],

  https: {
    cert: fs.readFileSync('/path/to/cert'),
    key: fs.readFileSync('/path/to/key'),
  },
});

server.run(8000);
```

#### With custom authentication

`generateCredentials` is called when a player joins a game with:

- `ctx`: The Koa context object, which can be used to generate tailored credentials from request headers etc.

`authenticateCredentials` is called when a player makes a move with:

  - `credentials`: The credentials sent from the player’s client
  - `playerMetadata`: The metadata object for the `playerID` making a move

Below is an example of how you might implement custom authentication with a hypothetical `authService` library.

The `generateCredentials` method checks for the Authorization header on incoming requests and tries to use it to decode a token. It returns an ID from the result, storing a public user ID as “credentials” in the game metadata.

The `authenticateCredentials` method passed to the `Server` also expects a similar token, which when decoded matches the ID stored in game metadata.


```js
const { Server } = require('boardgame.io/server');

const generateCredentials = async ctx => {
  const authHeader = ctx.request.headers['authorization'];
  const token = await authService.decodeToken(authHeader);
  return token.uid;
}

const authenticateCredentials = async (credentials, playerMetadata) => {
  if (credentials) {
    const token = await authService.decodeToken(credentials);
    if (token.uid === playerMetadata.credentials) return true;
  }
  return false;
}

const server = Server({
  games: [game1, game2, ...],
  generateCredentials,
  authenticateCredentials,
});

server.run(8000);
```

!> N.B. This approach is not currently compatible with how the React `<Lobby>` provides credentials.
