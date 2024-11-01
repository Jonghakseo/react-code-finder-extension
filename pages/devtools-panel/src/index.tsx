import { createRoot } from 'react-dom/client';
import '@src/index.css';
import Panel from '@src/Panel';
import { ChakraProvider } from '@chakra-ui/react';

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

import('@src/monacoConfig').then(() => {
  init();
  const tabId = chrome.devtools.inspectedWindow.tabId;
  chrome.tabs.sendMessage(tabId, { type: 'toggleOn' });
});
