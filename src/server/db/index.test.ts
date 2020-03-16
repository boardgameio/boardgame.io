import { DBFromEnv } from '.';

test('MONGO_URI', () => {
  process.env.MONGO_URI = 'test';
  process.env.MONGO_DATABASE = 'database';
  const db = DBFromEnv();
  expect(db.url).toBe('test');
  expect(db.dbname).toBe('database');
  delete process.env.MONGO_URI;
  delete process.env.MONGO_DATABASE;
});
