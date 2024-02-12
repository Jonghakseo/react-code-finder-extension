import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type CurrentDebugSourceStorage = BaseStorage<DebugSource[]> & {
  onChange: (callback: (value: DebugSource[]) => void) => () => void;
};

const storage = createStorage<DebugSource[]>('current-debug-source', [], {
  storageType: StorageType.Session,
  liveUpdate: true,
  sessionAccessForContentScripts: true,
});

export const currentDebugSourceStorage: CurrentDebugSourceStorage = {
  ...storage,
  onChange: callback => {
    return storage.subscribe(() => {
      callback(storage.getSnapshot() ?? []);
    });
  },
};
