# Deployment

## Heroku
[Heroku](https://heroku.com) uses 2 different ways to determine the run command of a node application. It is possible to either:

- Add a Procfile to the project root directory with the following line  
  `web: node -r esm server.js`

- Update the start script in the package.json to  
  `"start": "node -r esm server.js"`

On Heroku, a regular heroku/nodejs buildpack is necessary to build your app which is usually selected by default for node applications.  

### Frontend and Backend
In order to deploy a game to Heroku, the game has to be running on a single port. To do so, the [Server](/api/Server.md) has to handle both the API requests and serving the pages.  
Below is an example of how to achieve that.

First install these extra dependencies:

```
npm i koa-static
```
Then adjust your `server.js` file like this:

```js
// server.js

import { Server } from 'boardgame.io/server';
import path from 'path';
import serve from 'koa-static';
import { TicTacToe } from './game';

const server = Server({ games: [TicTacToe] });
const PORT = process.env.PORT || 8000;

// Build path relative to the server.js file
const frontEndAppBuildPath = path.resolve(__dirname, './build');
server.app.use(serve(frontEndAppBuildPath))

server.run(PORT, () => {
  server.app.use(
    async (ctx, next) => await serve(frontEndAppBuildPath)(
      Object.assign(ctx, { path: 'index.html' }),
      next
    )
  )
});
```

The [Lobby](/api/Lobby.md) might be as follows:

```jsx
import React from 'react';
import { Lobby } from 'boardgame.io/react';
import { TicTacToeBoard } from './board';
import { TicTacToe } from './game';

const server = `https://${window.location.hostname}`;
const importedGames = [{ game: TicTacToe, board: TicTacToeBoard }];

export default () => (
  <div>
    <h1>Lobby</h1>
    <Lobby gameServer={server} lobbyServer={server} gameComponents={importedGames} />
  </div>
);
```

Or, without the lobby, pass the server address when calling `SocketIO`:

```js
import { SocketIO } from 'boardgame.io/multiplayer';

const GameClient = Client({
  // ...
  multiplayer: SocketIO({ server: `https://${window.location.hostname}` }),
});
```

### Backend Only
If you only need to publish your backend to Heroku, your `server.js` can be simplified to this:

```js
// server.js

import { Server } from 'boardgame.io/server';
import { TicTacToe } from './game';

const server = Server({ games: [TicTacToe] });
const PORT = process.env.PORT || 8000;

server.run(PORT);
```

And your [Lobby](/api/Lobby.md) would now be pointing to your Heroku app URL:
```jsx
import React from 'react';
import { Lobby } from 'boardgame.io/react';
import { TicTacToeBoard } from './board';
import { TicTacToe } from './game';

const server = `https://yourapplication.herokuapp.com`;
const importedGames = [{ game: TicTacToe, board: TicTacToeBoard }];

export default () => (
  <div>
    <h1>Lobby</h1>
    <Lobby gameServer={server} lobbyServer={server} gameComponents={importedGames} />
  </div>
);
```

Or, without the lobby, pass the Heroku app URL when calling `SocketIO`:

```js
import { SocketIO } from 'boardgame.io/multiplayer';

const GameClient = Client({
  // ...
  multiplayer: SocketIO({ server: 'https://yourapplication.herokuapp.com' }),
});
```
