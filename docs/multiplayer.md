# Multiplayer

All you need to do is add `multiplayer: true` to your client
config object and the client will now start sending updates
to a server every time you make a move. This server will maintain
the game state, and also keep all clients connected to it in
sync in realtime (without any browser refreshes needed).

```js
// src/App.js

import { Client } from 'boardgame.io/react';
import { TicTacToe } from './game';
import { TicTacToeBoard } from './board';

const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: true,
});

export default App;
```

Note that we moved our game implementation to `src/game.js` and
board implementation to `src/board.js`.

```js
// src/game.js
import { Game } from 'boardgame.io/core';
export const TicTacToe = Game({ ... });
```

```js
// src/board.js
import React from 'react';
export class TicTacToeBoard extends React.Component { ... };
```

#### Setting Up the Server

Behind the scenes, the client is now sending updates to a server
via a WebSocket, and the server updates its version of the game
while also broadcasting the update to all connected clients.

For this to work, the server also needs to know what game you
are playing. Here is a snippet showing you how to set up a Node server
to serve the socket requests coming from the client. Copy this
to a new file (say `src/server.js`).

```js
const Server = require('boardgame.io/server').Server;
const TicTacToe = require('./game').TicTacToe;
const server = Server({ games: [TicTacToe] });
server.run(8000);
```

You can run the server using:

```
$ node src/server.js
```

If you used any ES2015 features like module imports or other features
like the object-spread syntax in `game.js` (which is likely the case
if you followed the tutorial), then you need to pipe the code through
[Babel](https://babeljs.io/) like so:

```
$ npm install -D babel-preset-zero babel-cli
$ npx babel-node --presets zero src/server.js
```

!> `npx` allows you to run binaries like `babel-node` from the
NPM repository easily. This is just one development setup,
and you may choose one of many other Babel setups during deployment.

This just brings up a server that's capable of servicing the socket
communication (not to be confused with the server that's serving
your web app), but we still need to tell our client to send all the
socket traffic to this server. This last step is not necessary if
you serve both your web app and socket server from the same Node
server (see below), but is only needed if you want to keep them
separate.

There are a few options here as well (**create-react-app** has a
[proxy](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#configuring-a-websocket-proxy) feature, for example), but the easiest would be to just
tell `boardgame.io` where your socket server is:

```js
const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: { server: 'localhost:8000' },
});
```

You may also specify a protocol here (if you want to use SSL, for example):

```js
const App = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: { server: 'https://localhost:8000/' },
});
```

#### Associating Clients with Players

Clients needs to be associated with a particular player in order
to make moves (clients that aren't are just spectators that can
see the live game state, but can't actually make any moves).
This is done by rendering your app like this:

```js
<App playerID="0" />
```

If you want to see both players on the same page, do something like this:

```js
const TicTacToeClient = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: { server: 'localhost:8000' },
  debug: false,
});

const App = () => (
  <div>
    <TicTacToeClient playerID="0" />
    <TicTacToeClient playerID="1" />
  </div>
);
```

!> Note that we disabled the debug pane here with `debug: false` so that
the screen isn't crowded.

Run `npm start` in a separate terminal (while also keeping your socket server
running) and watch as your moves in one board are reflected in the other.
You can also open different browser tabs and you will see that everything is
in sync as you play (state is not lost even if you refresh the page).

#### Multiple Game Types

You can also serve multiple types of games from the same socket server:

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

#### Game Instances

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

#### Single Server

You might want to serve both your web app and the socket
server from the same server.
The returned object from `Server()` contains `app`,
which is a [Koa](http://koajs.com/) app that
you can use to attach other handlers etc.

```js
// src/server.js

const path = require('path');
const KoaStatic = require('koa-static');
const Server = require('boardgame.io/server').Server;
const TicTacToe = require('./game').TicTacToe;

const server = Server({ games: [TicTacToe] });
const buildPath = path.join(__dirname, '../build');
server.app.use(KoaStatic(buildPath));
server.run(8000);
```

```
$ npm run build
$ npx babel-node --presets zero src/server.js

Navigate to http://localhost:8000/
```

#### Storage

The default storage implementation is an in-memory map.
If you want something that's more persistent, you can use one
of the bundled connectors for various backends, or even implement
your own connector. For example, here is how you can keep your
game state in a MongoDB.

```js
const { Server, Mongo } = require('boardgame.io/server');
const { TicTacToe } = require('./game');

const server = Server({
  games: [TicTacToe],
  db: new Mongo({
    url: 'mongodb://...',
    dbname: 'bgio',
  }),
});

server.run(8000);
```

See [here](storage.md) for more details about how to customize storage.
