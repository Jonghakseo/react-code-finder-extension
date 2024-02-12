import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { ignorePathsStorage } from '@src/shared/storages/ignorePathsStorage';
import { sendMessageToBackgroundAsync } from '@src/shared/chorme/message';
import { currentDebugSourceStorage } from '@src/shared/storages/currentDebugSourceStorage';
import { tempDebugSourceStorage } from '@src/shared/storages/tempDebugSourceStorage';

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
  if (event.data.source !== 'react-code-finder-from-inject') {
    return;
  }
  const message: MessageFromInjected = event.data;
  switch (message.type) {
    case 'getCurrentState': {
      const response = await sendMessageToBackgroundAsync({ type: 'getCurrentState' });
      postMessageToInjected('getCurrentState', response);
      break;
    }
    case 'setCurrentDebugSources': {
      sendMessageToBackgroundAsync({ type: 'openSidePanel' });
      const debugSources: DebugSource[] = JSON.parse(message.data);
      await currentDebugSourceStorage.set(debugSources);
      break;
    }
    case 'setTempDebugSource': {
      const debugSource: DebugSource = JSON.parse(message.data);
      await tempDebugSourceStorage.set(debugSource);
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
