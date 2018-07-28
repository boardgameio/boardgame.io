# Storage

The framework comes bundled with various connectors to different backends
depending on how you want to persist your game state.

### MongoDB

First, install the `mongodb` package:

```
npm install --save mongodb
```

Then modify your server spec to indicate that you want to connect to Mongo:

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

!> You can get a free Mongo instance at places like [mLab](https://mlab.com/).

### Firebase

First, install the necessary packages:

```
npm install --save firebase
```

Then modify your server spec to indicate that you want to connect to Firebase:

```js
const { Server, Firebase } = require('boardgame.io/server');
const { TicTacToe } = require('./game');

const server = Server({
  games: [TicTacToe],

  db: new Firebase({
    config: {
      apiKey: '...',
      authDomain: '...',
      databaseURL: '...',
      projectID: '...',
    },
    dbname: 'bgio',
  }),
});

server.run(8000);
```
