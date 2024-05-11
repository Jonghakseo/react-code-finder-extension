import React from 'react';
import { createRoot } from 'react-dom/client';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import Panel from '@pages/panel/Panel';
import { ChakraProvider } from '@chakra-ui/react';
import '@pages/panel/monacoConfig';

refreshOnUpdate('pages/panel');

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

init();
