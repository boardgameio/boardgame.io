# Multiplayer

All you need to do is add `multiplayer: true` to your client
config object and you have a multiplayer enabled client. You
can open multiple browser tabs and you will find that the
game board is synced in realtime across all of them
(without browser refreshes) as you make moves!

```js
import React from 'react';
import ReactDOM from 'react-dom';
import Client from 'boardgame.io/client';

const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: true
});

ReactDOM.render(<App/>, document.getElementById('root'));
```

Whenever you make a move, the framework sends an update to the
server via a WebSocket, and the server updates its version of
the game while also broadcasting the update to all connected
clients.

For this to work, the server needs to know what game you
are playing. Here is a snippet showing how to set it up
to serve the socket requests coming from the client.

```js
const Server = require('boardgame.io/server');
const TicTacToe = require('./tic-tac-toe');
const app = Server({ game: TicTacToe });
app.listen(8000);
```

In a real app, you might want to also serve your React
frontend from the same server as well. The returned object
`app` is a [Koa](http://koajs.com/) app that you can
use to attach other handlers etc.

```js
const KoaStatic = require('koa-static');
const Server = require('boardgame.io/server');
const TicTacToe = require('./tic-tac-toe');

const app = Server({ game: TicTacToe });
app.use(KoaStatic('path/to/dir'));
app.listen(8000);
```

By default, all client instances are synced to a game with
an ID `'default'`. To play a new game instance, just pass
`gameid` to your client `<App/>`. All clients that use
this ID will now see the same board (synced in realtime).

```
ReactDOM.render(<App gameid="my-game-id" />, document.getElementById('root'));
```

The `gameid` could be determined by a URL path, for example,
so you could have all browsers that connect to a certain
URL be synced to the same game.

!> Lobby and user matching features are coming, but you can
already create useful implementations where users can share
URLs to get friends to join a game.

