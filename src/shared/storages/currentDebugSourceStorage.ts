import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type CurrentDebugSourceStorage = BaseStorage<DebugSource | null> & {
  onChange: (callback: (value: DebugSource | null) => void) => () => void;
};

const storage = createStorage<DebugSource | null>('current-debug-source-key', null, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const currentDebugSourceStorage: CurrentDebugSourceStorage = {
  ...storage,
  onChange: callback => {
    return storage.subscribe(() => {
      callback(storage.getSnapshot() ?? null);
    });
  },
};
