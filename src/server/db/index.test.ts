import { DBFromEnv, FlatFile, AzureStorage } from '.';

test('FLATFILE_DIR', () => {
  process.env.FLATFILE_DIR = 'test';
  const db = DBFromEnv();
  expect(db).toBeInstanceOf(FlatFile);
  delete process.env.FLATFILE_DIR;
});

test('AZURE', () => {
  process.env.AZURE_STORAGE_CONNECTION_STRING = 'UseDevelopmentStorage=true';
  process.env.AZURE_STORAGE_CONTAINER_NAME = 'test';
  const db = DBFromEnv();
  expect(db).toBeInstanceOf(AzureStorage);
  delete process.env.AZURE_STORAGE_CONNECTION_STRING;
  delete process.env.AZURE_STORAGE_CONTAINER_NAME;
});
