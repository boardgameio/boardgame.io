import { InMemory } from './inmemory';
import { Mongo } from './mongo';
import { FlatFile } from './flatfile';

const DBFromEnv = () => {
  if (process.env.MONGO_URI && process.env.MONGO_DATABASE) {
    return new Mongo({
      url: process.env.MONGO_URI,
      dbname: process.env.MONGO_DATABASE,
    });
  } else {
    return new InMemory();
  }
};

export { InMemory, Mongo, FlatFile, DBFromEnv };
