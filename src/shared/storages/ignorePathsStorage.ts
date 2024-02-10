import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type Paths = string[];

type IgnorePathsStorage = BaseStorage<Paths> & {
  onChange: (callback: (value: Paths) => void) => () => void;
};

const storage = createStorage<Paths>('ignore-paths-storage-key', [], {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const ignorePathsStorage: IgnorePathsStorage = {
  ...storage,
  onChange: (callback: (value: Paths) => void) => {
    return storage.subscribe(() => {
      callback(storage.getSnapshot() ?? []);
    });
  },
};
