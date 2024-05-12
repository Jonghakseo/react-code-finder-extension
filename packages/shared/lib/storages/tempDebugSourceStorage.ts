import { DebugSource } from '@lib/types';
import { BaseStorage, createStorage, StorageType } from './base';

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
