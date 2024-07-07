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
has a single source of authority. If a move accesses state that is not
accessible to the client (for instance secret state), then optimistic
updates may need to be disabled for that move. See the
[secret state documentation](secret-state.md) for more details.

## Local Master

The game master can run completely on the browser. This is useful to set
up pass-and-play multiplayer or for prototyping the multiplayer experience
without having to set up a server to test it.

To do this `import { Local } from 'boardgame.io/multiplayer'`,
and add `multiplayer: Local()` to the client options.
Now you can instantiate as many of these clients in your app as you like and
you will notice that they’re all kept in sync, sharing the same state.

<!-- tabs:start -->

#### **Plain JS**

Let’s update our `TicTacToeClient` to receive an additional `playerID`
option in its constructor. We’ll use this so that each client knows
which player it is playing for.

Then, we’ll update how we create the boardgame.io client, passing
`playerID` and setting `multiplayer` to use the Local Master.

```js
import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { TicTacToe } from './Game';

class TicTacToeClient {
  constructor(rootElement, { playerID } = {}) {
    this.client = Client({
      game: TicTacToe,
      multiplayer: Local(),
      playerID,
    });
    // ...
  }
  // ...
}
````

Now instead of rendering one client into our app, we’ll render
one for each player ID:

```js
const appElement = document.getElementById('app');
const playerIDs = ['0', '1'];
const clients = playerIDs.map(playerID => {
  const rootElement = document.createElement('div');
  appElement.append(rootElement);
  return new TicTacToeClient(rootElement, { playerID });
});
```

[![Edit bgio-plain-js-multiplayer](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/bgio-plain-js-multiplayer-re48t?fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.js&theme=dark)

#### **React**

```js
// src/App.js

import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { TicTacToe } from './Game';
import { TicTacToeBoard } from './Board';

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

[![Edit boardgame.io](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/boardgameio-dibw3)
<!-- tabs:end -->

?> You may be wondering what the `playerID` parameter is from the
example above. Clients needs to be associated with a particular player
seat in order to make moves in a multiplayer setup. (If a client doesn’t have
a `playerID` it is a spectator that can see the live game state, but can't
actually make any moves.)

```react
<iframe class='plain' src='snippets/multiplayer' height='250' scrolling='no' title='example' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>
```

In the example above you can play as Player 0 and Player 1 alternately
on the two boards. Clicking on a particular board when it is not that
player's turn has no effect.

### Storing state in the browser

If you want game state to be saved in the browser using `localStorage`,
you can pass additional options when creating a local master:

```js
Local({
  // Enable localStorage cache.
  persist: true,

  // Set custom prefix to store data under. Default: 'bgio'.
  storageKey: 'bgio',
});
```

## Remote Master

// TODO icorporate our server setup

You can also run the game master on a separate server. Any boardgame.io
client can connect to this master (whether it is a browser, an Android
app etc.) and it will be kept in sync with other clients in realtime.

In order to connect a client to a remote master, we use the `multiplayer`
option again, but this time we import `SocketIO` instead of `Local`,
and specify the location of the server.

<!-- tabs:start -->

#### **Plain JS**

```js
import { SocketIO } from 'boardgame.io/multiplayer'

class TicTacToeClient {
  constructor(rootElement, { playerID } = {}) {
    this.client = Client({
      game: TicTacToe,
      multiplayer: SocketIO({ server: 'localhost:8000' }),
      playerID,
    });
    // ...
  }
  // ...
}
```

We also need to make a small tweak to our `update` method.
When using a remote master, the client won’t know the game state
when it first runs, so `update` will be called first with `null`,
then with the full game state after it connects to the server.

In a real implementation you might show a loading spinner to indicate
this, but we’ll just skip our `update` for now if state is `null`:

```js
update(state) {
  if (state === null) return;
  // ...
}
```

#### **React**

```js
import { SocketIO } from 'boardgame.io/multiplayer'

const TicTacToeClient = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: SocketIO({ server: 'localhost:8000' }),
});
```

<!-- tabs:end -->

Behind the scenes, the client now sends updates to the remote master
via a WebSocket whenever you make a move. Of course, we now need to run
a server at the location specified, which is discussed below.

### Setting up the server

We’ll create a new file at `src/server.js` to write our server code.

boardgame.io provides a server module that simplifies running the game
master on a Node server. We import that module and configure it with our
`TicTacToe` game object and a list of URL origins we want to allow to
connect to the server. Later you would set `origins` with your game’s domain
name, but for now we’ll import a default value that allows any locally served
page to connect.

```js
// src/server.js
const { Server, Origins } = require('boardgame.io/server');
const { TicTacToe } = require('./Game');

const server = Server({
  games: [TicTacToe],
  origins: [Origins.LOCALHOST],
});

server.run(8000);
```

?> See [the Server reference page](api/Server.md) for more detail on
   the various configuration options.

Because `Game.js` is an ES module, we will use [esm](https://github.com/standard-things/esm)
which enables us to use `import` statements in a Node environment:

```
npm install esm
```

We can then add a new script to our `package.json` to simplify
running the server:

```json
{
  "scripts": {
    "serve": "node -r esm src/server.js"
  }
}
```

We can now run `npm run serve` in one terminal to start the server and
`npm start` in another to serve our web app.
You can connect multiple clients to the same game by opening
your app in several different browser tabs.
You will notice that everything is kept in sync as you play
(state is not lost even if you refresh the page).

This example still has both players on the same screen. A more natural
setup would be to have each client just have a single (but distinct)
player.

<!-- tabs:start -->
#### **Plain JS**

You want one client to render:
```js
new TicTacToeClient(appElement, { playerID: '0' });
```

and another to render:
```js
new TicTacToeClient(appElement, { playerID: '1' });
```

#### **React**

You want one client to render:
```
<TicTacToeClient playerID="0" />
```

and another to render:
```
<TicTacToeClient playerID="1" />
```
<!-- tabs:end -->

One way to do this is to ask the player which seat they
want to take when they open your app and then set the
`playerID` accordingly. You can also use a URL path to
determine the player or use a matchmaking lobby.

Complete code from this section is available on CodeSandbox for both
[React](https://codesandbox.io/s/boardgameio-fsl8y) and
[Plain JS](https://codesandbox.io/s/bgio-plain-js-multiplayer-server-742oh)
versions.
To run the server, you can click **File** > **Export to ZIP** to download
the project, then run the server and client as described
above. Don't forget to run `npm install` in the project directory first!

?> **TIP** You can also set the `playerID` to point to any player while
prototyping by clicking on the box of that respective player on the debug UI.

### Multiple Game Types

You can serve multiple types of games from the same server:

```js
const app = Server({ games: [TicTacToe, Chess] });
```

For this to work correctly, make sure that each game
implementation specifies a name:

```js
const TicTacToe = {
  name: 'tic-tac-toe',
  // ...
};
```

### Game Instances

By default all client instances connect to a game with
an ID `'default'`. To play a new game instance, you can pass
`matchID` to your client. All clients that use
this ID will now see the same game state.

<!-- tabs:start -->

#### **Plain JS**

Pass `matchID` when creating your boardgame.io client:
```js
const client = Client({
  game: TicTacToe,
  matchID: 'matchID',
  // ...
});
```

You an also update a `matchID` on an already instantiated client:
```js
client.updateMatchID('newID');
```

#### **React**

```
<TicTacToeClient matchID="match-id"/>
```
<!-- tabs:end -->

The `matchID`, similar to the `playerID` can again be determined
either by a URL path or a lobby implementation.

### Storage

The default storage implementation is an in-memory map.
If you want something that's more persistent, you can use one
of the available database connectors, or even implement your own.

See [the storage docs](storage.md) for more details.
