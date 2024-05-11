import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

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
    storageType: StorageType.Session,
    liveUpdate: true,
    sessionAccessForContentScripts: true,
  },
);

export const devToolsStorage: DevtoolsStorage = {
  ...storage,
  checkIsOpen: () => {
    const snapShot = storage.getSnapshot();
    if (!snapShot || snapShot.openTime === undefined) {
      return false;
    }
    return snapShot.openTime - Date.now() < 1000;
  },
  open: () => {
    storage.set({ openTime: Date.now() });
  },
};
