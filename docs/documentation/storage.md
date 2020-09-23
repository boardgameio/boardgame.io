# Storage

**boardgame.io** is storage agnostic. Various adapters are
available that allow you to persist your game state in
different storage systems.

You can even write your [own adapter](/storage?id=writing-a-custom-adapter)
for a custom backend.

### Flatfile

First, install the necessary packages:

```
npm install node-persist
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

### Other backends

#### Firebase

Instructions at https://github.com/delucis/bgio-firebase.

#### Azure Storage

Instructions at https://github.com/c-w/bgio-azure-storage.

#### Postgres

Instructions at https://github.com/janKir/bgio-postgres.

#### MongoDB

Coming soon (used to be supported but is not in sync with the
latest release).

### Caching

Depending on your set-up, you may want the server to cache some of the data,
reducing the load on your database and speeding up server responses.
[bgio-storage-cache](https://github.com/delucis/bgio-storage-cache) offers
a basic caching model compatible with any boardgame.io database connector.

### Writing a Custom Adapter

Create a class that implements the [StorageAPI.Async](https://github.com/boardgameio/boardgame.io/blob/master/src/server/db/base.ts) interface.
