# Server

Creates a `boardgame.io` server. This is only required when
`multiplayer` is set to `true` on the client. It creates a
[Koa](http://koajs.com/) app that keeps track of the game
states of the various clients connected to it, and also
broadcasts updates to those clients so that all browsers
that are connected to the same game are kept in sync in
realtime.

### Arguments

A config object with the following options:

1. games (_array_): a list of game implementations
   (each is the return value of [Game](/api/Game.md)).

2. `db` (_object_): the [database connector](/storage).

3. transport (_object_): the transport implementation.
   If not provided, socket.io is used.

### Returns

An object that contains:

1. run (_function_): A function to run the server.
   Signature: (port, callback) => {}
2. kill (_function_): A function to stop the server.
   Signature: ({ apiServer, appServer }) => {}
3. app (_object_): The Koa app.
4. db (_object_): The `db` implementation.

### Usage

```js
const Server = require('boardgame.io/server').Server;

const server = Server({
  games: [game1, game2, ...],

  db: new DbConnector(),
});

server.run(8000);
```
