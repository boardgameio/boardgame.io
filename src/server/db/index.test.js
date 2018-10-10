import { DBFromEnv } from '.';

test('MONGO_URI', () => {
  process.env.MONGO_URI = 'test';
  const db = DBFromEnv();
  expect(db.url).toBe('test');
  delete process.env.MONGO_URI;
});

test('FIREBASE_CONFIG', () => {
  process.env.FIREBASE_APIKEY = 'test_apikey';
  process.env.FIREBASE_AUTHDOMAIN = 'test_authdomain';
  process.env.FIREBASE_DATABASEURL = 'test_databaseurl';
  process.env.FIREBASE_PROJECTID = 'test_projectid';
  process.env.FIREBASE_ENGINE = 'Firestore';
  const db = DBFromEnv();
  expect(db.engine).toBe('Firestore');
  expect(db.config).toEqual({
    apiKey: 'test_apikey',
    authDomain: 'test_authdomain',
    databaseURL: 'test_databaseurl',
    projectId: 'test_projectid',
  });
  delete process.env.FIREBASE_APIKEY;
  delete process.env.FIREBASE_AUTHDOMAIN;
  delete process.env.FIREBASE_DATABASEURL;
  delete process.env.FIREBASE_PROJECTID;
  delete process.env.FIREBASE_ENGINE;
});
