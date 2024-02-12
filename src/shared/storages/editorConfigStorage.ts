import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type EditorConfig = {
  fontSize: number;
  tabIndex: number;
  language: string;
  theme: string;
  typescript: { strict: boolean };
  /** monaco-editor IEditorMinimapOptions */
  minimap: {
    enabled: boolean;
    autohide: boolean;
    side: 'right' | 'left';
    size: 'proportional' | 'fill' | 'fit';
    showSlider: 'always' | 'mouseover';
    renderCharacters: boolean;
    maxColumn: number;
    scale: number;
  };
};

type EditorConfigStorage = BaseStorage<EditorConfig> & {
  onChange: (callback: (value: EditorConfig) => void) => () => void;
};

const initialConfig: EditorConfig = {
  fontSize: 12,
  tabIndex: 2,
  language: 'typescript',
  theme: 'vs-dark',
  typescript: { strict: true },
  minimap: {
    enabled: true,
    autohide: false,
    side: 'right',
    size: 'proportional',
    showSlider: 'mouseover',
    renderCharacters: true,
    maxColumn: 120,
    scale: 1,
  },
};

const storage = createStorage<EditorConfig>('editor-config-source', initialConfig, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const editorConfigStorage: EditorConfigStorage = {
  ...storage,
  onChange: callback => {
    return storage.subscribe(() => {
      callback(storage.getSnapshot() ?? initialConfig);
    });
  },
};
