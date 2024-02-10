import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { ignorePathsStorage } from '@src/shared/storages/ignorePathsStorage';
import { sendMessageToBackgroundAsync } from '@src/shared/chorme/message';
import { currentDebugSourceStorage } from '@src/shared/storages/currentDebugSourceStorage';

refreshOnUpdate('pages/content/injected');

function postMessageToInjected(type: string, data?: string) {
  return window.postMessage({ source: 'react-code-finder-to-inject', type, data }, '*');
}

/**
 * message from background
 */
chrome.runtime.onMessage.addListener(message => {
  switch (message.type) {
    case 'toggleOn':
      postMessageToInjected('toggleOn');
      break;
    case 'toggleOff':
      postMessageToInjected('toggleOff');
      break;
  }
});

/**
 * message from injected
 * @param event
 */
window.addEventListener('message', async function (event) {
  const data = event.data;
  if (data.source !== 'react-code-finder-from-inject') {
    return;
  }
  switch (event.data.type) {
    case 'getInitialState': {
      console.log('getInitialState');
      const response = await sendMessageToBackgroundAsync({ type: 'getInitialState' });
      postMessageToInjected('getInitialState', response);
      break;
    }
    case 'foundDebugSource': {
      await currentDebugSourceStorage.set(JSON.parse(data.data));
      break;
    }
  }
});

ignorePathsStorage.get().then(ignorePaths => {
  postMessageToInjected('setIgnorePaths', ignorePaths.join(','));
});
ignorePathsStorage.onChange(ignorePaths => {
  postMessageToInjected('setIgnorePaths', ignorePaths.join(','));
});

export {};
