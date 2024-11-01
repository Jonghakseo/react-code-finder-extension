import { BaseStorage, createStorage, StorageType } from './base';

export type InjectionConfig = {
  showCustomCursor: boolean;
  showHoverComponentFrame: boolean;
  showHoverComponentName: boolean;
  componentNamePosition: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  frameColor: string;
  preferredIDE?: 'vscode' | 'webstorm' | 'vscode-insiders';
};

type InjectConfigStorage = BaseStorage<InjectionConfig> & {
  onChange: (callback: (value: InjectionConfig) => void) => () => void;
};

const initialConfig: InjectionConfig = {
  showCustomCursor: false,
  showHoverComponentFrame: true,
  showHoverComponentName: true,
  componentNamePosition: 'bottom-left',
  frameColor: '#1fd3ee',
  preferredIDE: 'vscode',
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
