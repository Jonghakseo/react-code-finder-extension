import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type InjectionConfig = {
  showCustomCursor: boolean;
  showHoverComponentFrame: boolean;
  showHoverComponentName: boolean;
  frameColor: string;
};

type InjectConfigStorage = BaseStorage<InjectionConfig> & {
  onChange: (callback: (value: InjectionConfig) => void) => () => void;
};

const initialConfig: InjectionConfig = {
  showCustomCursor: false,
  showHoverComponentFrame: true,
  showHoverComponentName: true,
  frameColor: '#1fd3ee',
};

const storage = createStorage<InjectionConfig>('injection-config-source', initialConfig, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const injectionConfigStorage: InjectConfigStorage = {
  ...storage,
  onChange: callback => {
    return storage.subscribe(() => {
      callback(storage.getSnapshot() ?? initialConfig);
    });
  },
};
