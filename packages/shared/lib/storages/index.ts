import { createStorage, StorageType, type BaseStorage, SessionAccessLevel } from './base';
import { currentDebugSourceStorage } from './currentDebugSourceStorage';
import { devToolsStorage } from './devToolsStorage';
import { ignorePathsStorage } from './ignorePathsStorage';
import { editorConfigStorage } from './editorConfigStorage';
import { tempDebugSourceStorage } from './tempDebugSourceStorage';
import { injectionConfigStorage } from './injectionConfigStorage';

export {
  currentDebugSourceStorage,
  devToolsStorage,
  ignorePathsStorage,
  editorConfigStorage,
  tempDebugSourceStorage,
  injectionConfigStorage,
  createStorage,
  StorageType,
  SessionAccessLevel,
  BaseStorage,
};
