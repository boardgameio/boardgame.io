const Sequelize = require('sequelize');
import { DBFromEnv } from './index';

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

test('MYSQL_URL', () => {
  process.env.MYSQL_URL = 'mysql://test';
  const db = DBFromEnv();
  expect(db.db).toBeInstanceOf(Sequelize);
  delete process.env.MYSQL_URL;
});

test('SQLITE_PATH', () => {
  process.env.SQLITE_PATH = 'sqlite://test';
  const db = DBFromEnv();
  expect(db.db).toBeInstanceOf(Sequelize);
  delete process.env.SQLITE_PATH;
});

test('POSTGRES_URL', () => {
  process.env.POSTGRES_URL = 'postgres://test';
  const db = DBFromEnv();
  expect(db.db).toBeInstanceOf(Sequelize);
  delete process.env.POSTGRES_URL;
});
