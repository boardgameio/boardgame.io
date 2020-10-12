# Deployment

## Serverless Options

For one-player or pass-and-play games, you may not need the boardgame.io game
server and prefer to serve an app that runs entirely on the client. If you
don’t need multiplayer features, this can be a lot simpler than getting a
Node.js server deployed.

There are many services that can help deploy a static app, including some that
offer free options like [Netlify](https://www.netlify.com/) and
[Render](https://render.com/).

<!-- tabs:start -->

### **Plain JS**

If you followed along with the Plain JS tutorial, you can also use Parcel to
build your app for production.

Add a build script to your `package.json`:

```json
{
  "scripts": {
    "build": "parcel build index.html --out-dir build",
  }
}
```

Running `npm run build` will now create an optimised production build in
`/build`, which you can host just about anywhere.

#### Deployment configuration

Both Netlify and Render offer options to continuously deploy the latest version
of your app from a Git repository. These configurations should help you get
up and running with these services.

<details>
<summary><strong>Netlify</strong></summary>

1. Create a new deployment (see [Netlify docs](https://docs.netlify.com/site-deploys/create-deploys/)).

2. Use the following values for the deployment:

  | Option            | Value           |
  |-------------------|-----------------|
  | Build Command     | `npm run build` |
  | Publish Directory | `build`         |

</details>

<details>
<summary><strong>Render</strong></summary>

1. Create a new Web Service on Render and connect it to your project repository.

2. Use the following values during creation:

  | Option            | Value           |
  |-------------------|-----------------|
  | Environment       | `Static Site`   |
  | Build Command     | `npm run build` |
  | Publish Directory | `build`         |

</details>

### **React**

Running `npm run build` in a Create React App project will create an optimised
production build in `/build`, which you can host just about anywhere.

#### Deployment guides

- **Netlify:** See [the guide on how to deploy to Netlify](https://create-react-app.dev/docs/deployment/#netlify) in the Create React App docs.

- **Render:** See [“Deploy a Create React App Static Site”](https://render.com/docs/deploy-create-react-app) in the Render docs.

<!-- tabs:end -->

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

const { protocol, hostname, port } = window.location;
const server = `${protocol}//${hostname}:${port}`;
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

const { protocol, hostname, port } = window.location;
const server = `${protocol}//${hostname}:${port}`;

const GameClient = Client({
  // ...
  multiplayer: SocketIO({ server }),
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
