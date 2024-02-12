import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type TempDebugSourceStorage = BaseStorage<DebugSource | null> & {
  onChange: (callback: (value: DebugSource | null) => void) => () => void;
};

const storage = createStorage<DebugSource | null>('temp-debug-source', null, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const tempDebugSourceStorage: TempDebugSourceStorage = {
  ...storage,
  onChange: callback => {
    return storage.subscribe(() => {
      callback(storage.getSnapshot() ?? null);
    });
  },
};
