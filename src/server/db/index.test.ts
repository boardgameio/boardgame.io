import { DBFromEnv, FlatFile } from '.';

test('FLATFILE_DIR', () => {
  process.env.FLATFILE_DIR = 'test';
  const db = DBFromEnv();
  expect(db).toBeInstanceOf(FlatFile);
  delete process.env.FLATFILE_DIR;
});
