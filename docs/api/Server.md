# Server

```js
Server({
  // The return value of Game().
  game: game,

  // The number of players.
  numPlayers: 2,
})
```

Creates a `boardgame.io` server. This is only required when
`multiplayer` is set to `true` on the client. It creates a
[Koa](http://koajs.com/) app that keeps track of the game
states of the various clients connected to it, and also
broadcasts updates to those clients so that all browsers
that are connected to the same game are kept in sync in
realtime.

Notice that `game` is the same object that you also pass
to the `Client` call.

### Arguments
1. obj(*object*): A config object with the options shown above.

### Returns
(`app`): A Koa app.

### Usage

```js
const Server = require('boardgame.io/server');

const app = Server({
  ...
});

app.listen(8000);
```
