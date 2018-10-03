# Server

Creates a `boardgame.io` server. This is only required when
`multiplayer` is set to `true` on the client. It creates a
[Koa](http://koajs.com/) app that keeps track of the game
states of the various clients connected to it, and also
broadcasts updates to those clients so that all browsers
that are connected to the same game are kept in sync in
realtime.

The `games` argument takes a list of game implementations
(each is the return value of [Game](/api/Game.md)).

### Arguments

1. obj(_object_): A config object with the options shown below.

### Returns

An object that contains:

1. run (_function_): A function to run the server.
   Signature: (port, callback) => {}
2. app (_object_): The Koa app.
3. db (_object_): The `db` implementation.

### Usage

```js
const Server = require('boardgame.io/server').Server;

const server = Server({
  games: [game1, game2, ...],

  // Optional, if you want to hook it up to a
  // custom storage backend not supported by
  // the framework. DbImpl must implement the
  // same interface shown in db.js:
  // https://github.com/nicolodavis/boardgame.io/blob/master/src/server/db.js
  db: new DbImpl(),
});

server.run(8000);
```

# Authentication

You can optionally choose to require clients to use credential tokens to prove they have the right to send actions on behalf of a player.

Authenticated games are created with server-side tokens for each player. You can create a game with the `games/create` API call, and join a player to a game with the `gameInstances/join` API call.

A game that is authenticated will not accept moves from a client on behalf of a player without the appropriate credential token.

Use the create API call to create a game that requires credential tokens. When you call the join API, you can retrieve the credential token for a particular player.

Authentication APIs are available by default on `WebSocket port` + 1.

### Creating a game

#### `/games/:name/create`

Creates a new authenticated game for a game named `name`.

Accepts one parameter: `numPlayers`, which is required & indicates how many credentials to create.

Returns `gameID`, which is the ID of the newly created game instance.

### Joining a game

#### `/games/:name/:id/join`

Allows a player to join a particular game instance `id` of a game named `name`.

Accepts three parameters, all required:

`playerID`: the ordinal player in the game that is being joined (0, 1...)

`playerName`: the display name of the player joining the game.

Returns `playerCredentials` which is the token this player will require to authenticate their actions in the future.

### Client Authentication

All actions for an authenticated game require an additional payload field: `credentials`, which must be the given secret associated to the player.
