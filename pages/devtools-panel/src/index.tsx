import { createRoot } from 'react-dom/client';
import '@src/index.css';
import Panel from '@src/Panel';
import { ChakraProvider } from '@chakra-ui/react';
import { initEditor } from '@chrome-extension-boilerplate/monaco-editor';

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(
    <ChakraProvider>
      <Panel />
    </ChakraProvider>,
  );
}

initEditor(init);
