# Storage

The framework comes bundled with various connectors to different backends
depending on how you want to persist your game state. You can even
write your [own connector](/storage?id=writing-a-custom-connector)
for a custom backend.

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

### Flatfile database with [node-persist](https://github.com/simonlast/node-persist)

First, install the necessary packages:

```
npm install --save node-persist
```

Then modify your server spec to indicate that you want to connect to the flatfile database:

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

### SQLite/MySQL/MSSQL/PostgreSQL

First, install the appropriate packages per http://docs.sequelizejs.com/manual/installation/getting-started#installation .

Then modify your server spec to indicate that you want to use the SQL connector:

```js
const { Server, SQL } = require('boardgame.io/server');
const { TicTacToe } = require('./game');

const server = Server({
  games: [TicTacToe],

  db: new SQL({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  }),
});

server.run(8000);
```

The SQL() constructor passes all arguments to Sequelize.  When no arguments are provided, an in-memory SQLite database will be used (like the example above).

A list of parameters can be found at http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor .


### Writing a Custom Connector

Just create a class with the same interface as
https://github.com/nicolodavis/boardgame.io/blob/master/src/server/db/inmemory.js and instantiate it instead of one of the connectors above.
