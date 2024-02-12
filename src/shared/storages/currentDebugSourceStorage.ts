import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type CurrentDebugSourceStorage = BaseStorage<DebugSource[]> & {
  onChange: (callback: (value: DebugSource[]) => void) => () => void;
};

const storage = createStorage<DebugSource[]>('current-debug-source', [], {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const currentDebugSourceStorage: CurrentDebugSourceStorage = {
  ...storage,
  onChange: callback => {
    return storage.subscribe(() => {
      callback(storage.getSnapshot() ?? []);
    });
  },
};
