import { createRoot } from 'react-dom/client';
import '@src/index.css';
import Panel from '@src/Panel';
import { ChakraProvider } from '@chakra-ui/react';
import { initEditor } from '@chrome-extension-boilerplate/monaco-editor';
import { devToolsStorage } from '@chrome-extension-boilerplate/shared';

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  window.addEventListener('beforeunload', () => {
    devToolsStorage.hide();
    chrome.runtime.sendMessage({ type: 'toggleOff' });
  });
  root.render(
    <ChakraProvider>
      <Panel />
    </ChakraProvider>,
  );
}

initEditor(init);
