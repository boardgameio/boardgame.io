# Server

Creates a `boardgame.io` server. This is only required when
`multiplayer` is set to `true` on the client. It creates a
[Koa](http://koajs.com/) app that keeps track of the game
states of the various clients connected to it, and also
broadcasts updates to those clients so that all browsers
that are connected to the same game are kept in sync in
realtime.

The server also hosts a REST [API](/api/API) that is used for creating
and joining games. This is hosted on the same port, but can
be configured to run on a separate port.

### Arguments

A config object with the following options:

1. `games` (_array_): a list of game implementations
   (each is the return value of [Game](/api/Game.md)).

2. `db` (_object_): the [database connector](/storage).
   If not provided, an in-memory implementation is used.

3. `transport` (_object_): the transport implementation.
   If not provided, socket.io is used.

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

```
server.run(8000, () => console.log("server running..."));
```

##### Running the API server on a separate port

```js
server.run({ port: 8000, apiPort: 8001 });
```
