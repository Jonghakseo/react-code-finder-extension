import { BaseStorage, createStorage, StorageType } from './base';

type Status = {
  openTime?: number;
};

type DevtoolsStorage = BaseStorage<Status> & {
  checkIsOpen: () => boolean;
  open: () => void;
};

const storage = createStorage<Status>(
  'dev-tools',
  {
    openTime: undefined,
  },
  {
    storageType: StorageType.Sync,
    liveUpdate: true,
  },
);

export const devToolsStorage: DevtoolsStorage = {
  ...storage,
  checkIsOpen: () => {
    const snapShot = storage.getSnapshot();
    if (!snapShot || snapShot.openTime === undefined) {
      return false;
    }
    // check if the devtools is opened within 1 second
    return Date.now() - snapShot.openTime < 1000;
  },
  open: () => {
    storage.set({ openTime: Date.now() });
  },
};
