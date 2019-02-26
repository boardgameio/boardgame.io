import { InMemory } from './inmemory';
import { Mongo } from './mongo';
import { Firebase } from './firebase';
import { FlatFile } from './flatfile';

const DBFromEnv = () => {
  if (process.env.MONGO_URI && process.env.MONGO_DATABASE) {
    return new Mongo({
      url: process.env.MONGO_URI,
      dbname: process.env.MONGO_DATABASE,
    });
  } else if (
    process.env.FIREBASE_APIKEY &&
    process.env.FIREBASE_AUTHDOMAIN &&
    process.env.FIREBASE_DATABASEURL &&
    process.env.FIREBASE_PROJECTID
  ) {
    const config = {
      apiKey: process.env.FIREBASE_APIKEY,
      authDomain: process.env.FIREBASE_AUTHDOMAIN,
      databaseURL: process.env.FIREBASE_DATABASEURL,
      projectId: process.env.FIREBASE_PROJECTID,
    };
    return new Firebase({ config, engine: process.env.FIREBASE_ENGINE });
  } else {
    return new InMemory();
  }
};

export { InMemory, Mongo, Firebase, FlatFile, DBFromEnv };
