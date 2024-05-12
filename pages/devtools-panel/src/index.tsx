import { createRoot } from 'react-dom/client';
import '@src/index.css';
import Panel from '@src/Panel';
import { ChakraProvider } from '@chakra-ui/react';
import { setMonacoConfig } from '@src/monacoConfig';

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

setMonacoConfig().then(() => {
  init();
});
