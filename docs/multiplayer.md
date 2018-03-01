# Multiplayer

All you need to do is add `multiplayer: true` to your client
config object and you have a multiplayer enabled client. You
can open multiple browser tabs and you will find that the
game board is synced in realtime across all of them
(without browser refreshes) as you make moves!

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Client from 'boardgame.io/react';

const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: true,
});

ReactDOM.render(<App />, document.getElementById('root'));
```

Whenever you make a move, the framework sends an update to the
server via a WebSocket, and the server updates its version of
the game while also broadcasting the update to all connected
clients.

For this to work, the server needs to know what game you
are playing. Here is a snippet showing how to set it up
to serve the socket requests coming from the client.

```js
const Server = require('boardgame.io/server').Server;
const TicTacToe = require('./tic-tac-toe');
const server = Server({ games: [TicTacToe] });
server.run(8000);
```

You can also serve multiple types of games from the same server:

```js
const app = Server({ games: [TicTacToe, Chess] });
```

For this to work correctly, make sure that each game
implementation specifies a name in the `Game` constructor:

```js
const TicTacToe = Game({
  name: 'tic-tac-toe',
  ...
})
```

By default, all client instances are synced to a game with
an ID `'default'`. To play a new game instance, just pass
`gameID` to your client `<App/>`. All clients that use
this ID will now see the same board (synced in realtime).

```
ReactDOM.render(<App gameID="gameid"/>, document.getElementById('root'));
```

The `gameID` could be determined by a URL path, for example,
so you could have all browsers that connect to a certain
URL be synced to the same game.

#### Production

In a real app, you might want to also serve your React
frontend from the same server as well. The returned object
contains `app`, which is a [Koa](http://koajs.com/) app that
you can use to attach other handlers etc.

```js
const KoaStatic = require('koa-static');
const Server = require('boardgame.io/server').Server;
const TicTacToe = require('./tic-tac-toe');

const server = Server({ games: [TicTacToe] });
server.app.use(KoaStatic('path/to/dir'));
server.run(8000);
```

You might also want to keep them separate (one server to serve the web app
and another one to serve the socket requests). In this case, you
can have the client specify a socket server in the `multiplayer` option.

```js
Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: { server: 'hostname:port' },
});
```

#### Database

The default storage implementation is an in-memory map. However,
you can provide your own adapter to connect to any backend, or
use the bundled MongoDB connector.

```js
const { Server, Mongo } = require('boardgame.io/server');
const TicTacToe = require('./tic-tac-toe');

const server = Server({
  games: [TicTacToe],
  db: new Mongo({
    url: 'mongodb://...',
    dbname: 'bgio',
  }),
});

server.run(8000);
```

!> You can get a free MongoDB instance at places like mlab.com.
