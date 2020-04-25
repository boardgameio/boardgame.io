import { InMemory } from './inmemory';
import { FlatFile } from './flatfile';
import { AzureStorage } from './azurestorage';

const DBFromEnv = () => {
  if (process.env.FLATFILE_DIR) {
    return new FlatFile({
      dir: process.env.FLATFILE_DIR,
    });
  } else if (
    process.env.AZURE_STORAGE_CONNECTION_STRING &&
    process.env.AZURE_STORAGE_CONTAINER_NAME
  ) {
    return new AzureStorage({
      client: require('@azure/storage-blob').BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING
      ),
      container: process.env.AZURE_STORAGE_CONTAINER_NAME,
    });
  } else {
    return new InMemory();
  }
};

export { InMemory, FlatFile, AzureStorage, DBFromEnv };
