import { editor } from 'monaco-editor';

export { editor };

export function initEditor(init: () => void) {
  import('./monacoConfig').then(() => {
    init();
  });
}
