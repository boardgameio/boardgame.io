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

First, install the Firebase Admin Node.js SDK:

```
npm install --save firebase-admin
```

Download a service account key with the Cloud Datastore User role,
then modify your server spec to indicate that you want to connect to Firebase:

```js
const { Server, Firebase } = require('boardgame.io/server');
const { TicTacToe } = require('./game');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const server = Server({
  games: [TicTacToe],

  db: new Firebase({
    config: {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: '...',
    },
    engine: 'Firestore',
    adminClient: true,
  }),
});

server.run(8000);
```

#### Constructor

The `Firebase` constructor is passed an object with the following properties:

1. `config` (_object_): passed to the underlying SDK's `initializeApp` function.
   See the Firebase
   [Admin SDK](https://firebase.google.com/docs/admin/setup) or
   [Web SDK](https://firebase.google.com/docs/web/setup) for information
   on what this should contain.

2. `dbname` (_string_): the name of the database within the Firebase project.
   If not provided, `bgio` is used.

3. `engine` (_string_): the underlying database engine.
   Can be `Firestore` or `RTDB`. If not provided, `RTDB` is used.

4. `cacheSize` (_number_): size of the cache in games.
   If not provided, 1000 is used.

5. `adminClient` (_boolean_): whether to use the Firebase Admin SDK.
   If true, create a client using the Firebase Admin SDK (`firebase-admin`
   module). If false or not provided, create a client using the Firebase
   Web Client SDK (`firebase` module). The Admin SDK should be preferred.
   Note the corresponding `config` objects are not compatible.

### Flatfile

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

### Writing a Custom Connector

Just create a class with the same interface as
https://github.com/nicolodavis/boardgame.io/blob/master/src/server/db/inmemory.js and instantiate it instead of one of the connectors above.
