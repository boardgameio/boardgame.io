# Deployment

## Heroku
In order to deploy a game to [Heroku](heroku.com), the game has to be running on a single port. To do so, the [Server](/api/Server.md) has to handle both the API requests and serving the pages. Below is an example on how to achieve that.

```js
import { Server } from 'boardgame.io/server'
import path from 'path'
import Koa from 'koa'
import serve from 'koa-static'
import mount from 'koa-mount'
import { TicTacToe } from './game';

const server = Server({ games: [TicTacToe] });
const PORT = process.env.PORT || 8000

// Build path relative to the server.js file
const buildPath = './build'
const frontEndAppBuildPath = path.resolve(__dirname, buildPath)

const static_pages = new Koa()
//serve the build directory
static_pages.use(serve(frontEndAppBuildPath)) 
server.app.use(mount('/', static_pages))
server.run(PORT, () => {
    server.app.use(
        async (ctx, next) => await serve(frontEndAppBuildPath)(Object.assign(ctx, { path: 'index.html' }), next)
    )
})
``` 

On Heroku, a regular heroku/nodejs buildpack is then necessary to build your app.  
Here is an example on how the [Lobby](/api/Lobby.md) would look like.

```js
import React from 'react'
import { Lobby } from 'boardgame.io/react'
import { TicTacToeBoard } from './board';
import { TicTacToe } from './game';

const server = `https://${window.location.hostname}`
const importedGames = [{ game: TicTacToe, board: TicTacToeBoard }]

export default () => (
  <div>
    <h1>Lobby</h1>
    <Lobby gameServer={server} lobbyServer={server} gameComponents={importedGames} />
  </div>
)
```