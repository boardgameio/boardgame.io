# Storage

**boardgame.io** is storage agnostic. Various adapters are
available that allow you to persist your game state in
different storage systems.

You can even write your [own adapter](/storage?id=writing-a-custom-adapter)
for a custom backend.

### Flatfile

First, install the necessary packages:

```
npm install --save node-persist
```

Then modify your server spec to indicate that you want to connect to a flatfile database:

```js
const { Server, FlatFile } = require('boardgame.io/server');
const { TicTacToe } = require('./game');

const server = Server({
  games: [TicTacToe],

  db: new FlatFile({
    dir: '/storage/directory',
    logging: (true/false),
    ttl: (optional, see node-persist docs),
  }),
});

server.run(8000);
```

### Firebase

Instructions at https://github.com/delucis/bgio-firebase.

### Postgres

Coming soon.

### MongoDB

Coming soon (used to be supported but is not in sync with the
latest release).

### Writing a Custom Adapter

Create a class that implements the [StorageAPI.Async](https://github.com/nicolodavis/boardgame.io/blob/master/src/server/db/base.ts) interface.
