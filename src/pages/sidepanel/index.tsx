import React from 'react';
import { createRoot } from 'react-dom/client';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import SidePanel from '@pages/sidepanel/SidePanel';
import { ChakraProvider } from '@chakra-ui/react';
import { languages } from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

refreshOnUpdate('pages/sidepanel');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: never, label: string) {
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

languages.typescript.typescriptDefaults.setCompilerOptions({
  target: languages.typescript.ScriptTarget.Latest,
  allowNonTsExtensions: true,
  moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
  module: languages.typescript.ModuleKind.CommonJS,
  lib: ['dom'],
  noEmit: true,
  esModuleInterop: true,
  strict: false,
  jsx: languages.typescript.JsxEmit.React,
  reactNamespace: 'React',
  allowJs: true,
  typeRoots: ['node_modules/@types'],
});

languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
  diagnosticCodesToIgnore: [
    8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010, 8011, 8012, 8013, 8014, 8015, 8016, 8017, 8019,
  ],
});

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(
    <ChakraProvider>
      <SidePanel />
    </ChakraProvider>,
  );
}

init();
