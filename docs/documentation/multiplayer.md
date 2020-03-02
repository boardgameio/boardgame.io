# Multiplayer

In this section, we'll explain how the framework converts your
game logic into a multiplayer implementation without requiring
you to write any networking or storage layer code. We will continue
working with our Tic-Tac-Toe example from the [tutorial](tutorial.md).

### Clients and Masters

A boardgame.io client is what you create using the `Client` call.
You initialize it with your game object (which contains the moves),
so it has all the information that is needed to run the game.
This is where the story ends in a single player setup.

In a multiplayer setup, clients no longer act as authoritative
stores of the game state. Instead, they delegate the running of the
game to a game master. In this mode clients emit moves / events,
but the game logic runs on the master, which computes the next game state
before broadcasting it to other clients.

However, since clients are aware of the game rules, they also
run the game in parallel (this is called an optimistic update and is
an optimization that provides a lag-free experience).
In case a particular client computes the new game state incorrectly,
it is overridden by the master eventually, so the entire setup still
has a single source of authority.

### Local Master

The game master can run completely on the browser. This is useful to set
up pass-and-play multiplayer or for prototyping the multiplayer experience
without having to set up a server to test it.

All you need to do is to add `import { Local } from 'boardgame.io/multiplayer'`,
and in your config write `multiplayer: Local()`. Now you can instantiate as many 
of these clients in your app and you will notice that they're all kept in sync,
playing in the same game.

```js
// src/App.js

import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { TicTacToe } from './game';
import { TicTacToeBoard } from './board';

const TicTacToeClient = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: Local(),
});

const App = () => (
  <div>
    <TicTacToeClient playerID="0" />
    <TicTacToeClient playerID="1" />
  </div>
);

export default App;
```

!> You may be wondering what the `playerID` parameter is from the
example above. Clients needs to be associated with a particular player
seat in order to make moves in a multiplayer setup (clients that aren't
are just spectators that can see the live game state, but can't actually
make any moves).

Note that we moved our game implementation to `src/game.js` and
board implementation to `src/board.js`.

```js
// src/game.js
export const TicTacToe = { ... };
```

```js
// src/board.js
import React from 'react';
export class TicTacToeBoard extends React.Component { ... };
```

```react
<iframe class='plain' src='snippets/multiplayer' height='250' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

?> In the example above you can play as Player 0 and Player 1 alternately
on the two boards. Clicking on a particular board when it is not that
player's turn has no effect.

[![Edit boardgame.io](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/boardgameio-dibw3)

### Remote Master

You can also run the game master on a separate server. Any boardgame.io
client can connect to this master (whether it is a browser, an Android
app etc.) and it will be kept in sync with other clients in realtime.

In order to connect a client to a remote master, we use the `multiplayer`
option again, but this time we add `import { SocketIO } from 'boardgame.io/multiplayer'`,
and specify the location of the server.

```js
const TicTacToeClient = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: SocketIO({ server: 'localhost:8000' }),
});
```

You may also specify a protocol here (if you want to use SSL, for example):

```js
const TicTacToeClient = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: SocketIO({ server: 'https://localhost:8000/' }),
});
```

Behind the scenes, the client now sends updates to the remote master
via a WebSocket whenever you make a move. Of course, we now need to run
a server at the location specified, which is discussed below.

#### Setting up the server

In order to run the game master on a Node server, we need to provide
it with the `TicTacToe` game object so that it knows how to update the
game state.

```js
// src/server.js
const Server = require('boardgame.io/server').Server;
const TicTacToe = require('./game').TicTacToe;
const server = Server({ games: [TicTacToe] });
server.run(8000);
```

Run the server using a recent version of Node (v8 or above). We use [esm](https://github.com/standard-things/esm) here to import `game.js` (which is an ES module) in a Node environment:

```
$ npm i esm
$ node -r esm src/server.js
```

Run `npm start` in a separate terminal (while also keeping your server
running). You can now connect multiple clients to the same game by opening
different browser tabs and pointing them to `http://localhost:3000/`.
You will notice that everything is kept in sync as you play
(state is not lost even if you refresh the page).

This example still has both players on the same screen. A more natural
setup would be to have each client just have a single (but distinct)
player.

You want one client to render:

```
<TicTacToeClient playerID="0" />
```

and another to render:

```
<TicTacToeClient playerID="1" />
```

One way to do this is to just ask the player which seat they
want to take at the beginning of the game and then set the
`playerID` prop accordingly. You can also use a URL path to
determine the player or a matchmaking lobby.

Complete code from this section is available on [CodeSandbox](https://codesandbox.io/s/boardgameio-fsl8y). To run it, click on the
download button, then run the server and client as described
above (don't forget to run `npm install` first).

!> **TIP** You can also set the `playerID` to point to any player while
prototyping by clicking on the box of that respective player on the debug UI.

#### Multiple Game Types

You can serve multiple types of games from the same server:

```js
const app = Server({ games: [TicTacToe, Chess] });
```

For this to work correctly, make sure that each game
implementation specifies a name:

```js
const TicTacToe = {
  name: 'tic-tac-toe',
  ...
};
```

#### Game Instances

By default all client instances connect to a game with
an ID `default`. To play a new game instance, just pass
`gameID` to your client. All clients that use
this ID will now see the same game state.

```
ReactDOM.render(<TicTacToeClient gameID="gameid"/>, document.getElementById('root'));
```

The `gameID`, similar to the `playerID` can again be determined
either by a URL path or a lobby implementation.

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
