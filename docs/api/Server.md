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
const Server = require('boardgame.io/server');

const server = Server({
  games: [game1, game2, ...],

  // Optional, if you want to hook it up to a
  // custom storage backend not supported by
  // the framework. DbImpl must implement the
  // same interface shown in db.js:
  // https://github.com/google/boardgame.io/blob/master/src/server/db.js
  db: new DbImpl(),
});

server.run(8000);
```
