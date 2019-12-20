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

### Arguments

A config object with the following options:

1. `games` (_array_): a list of game implementations
   (each should be an object conforming to the [Game API](/api/Game.md)).

2. `db` (_object_): the [database connector](/storage).
   If not provided, an in-memory implementation is used.

3. `transport` (_object_): the transport implementation.
   If not provided, socket.io is used.
   
4. `generateCredentials` (_function_): an optional function that returns player credentials to store in the game metadata and validate against. If not specified, the Lobby’s `uuid` implementation will be used.

5. `authenticateCredentials` (_function_): an optional function that tests if a player’s move is made with the correct credentials when using the default socket.io transport implementation.

### Returns

An object that contains:

1. run (_function_): A function to run the server.
   _(portOrConfig, callback) => ({ apiServer, appServer })_
2. kill (_function_): A function to stop the server.
   _({ apiServer, appServer }) => {}_
3. app (_object_): The Koa app.
4. db (_object_): The `db` implementation.

### Usage

##### Basic

```js
const Server = require('boardgame.io/server').Server;

const server = Server({
  games: [game1, game2, ...],

  db: new DbConnector(),
});

server.run(8000);
```

##### With callback

```js
server.run(8000, () => console.log("server running..."));
```

##### With custom authentication

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
