import { BaseStorage, createStorage, StorageType } from './base';

type Status = {
  isShown: boolean;
  openTime: number | null;
};

type DevtoolsStorage = BaseStorage<Status> & {
  checkIsOpen: () => boolean;
  open: () => void;
  show: () => void;
  hide: () => void;
};

const storage = createStorage<Status>(
  'dev-tools',
  {
    isShown: false,
    openTime: null,
  },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

export const devToolsStorage: DevtoolsStorage = {
  ...storage,
  checkIsOpen: () => {
    const snapShot = storage.getSnapshot();
    if (!snapShot || snapShot.openTime === null || !snapShot.isShown) {
      return false;
    }
    // check if the devtools is opened within 1.5 second
    return Date.now() - snapShot.openTime < 1500;
  },
  open: async () => {
    await storage.set({ ...(await storage.get()), openTime: Date.now() });
  },
  show: async () => {
    await storage.set({ ...(await storage.get()), isShown: true });
  },
  hide: async () => {
    await storage.set({ ...(await storage.get()), isShown: false });
  },
};
