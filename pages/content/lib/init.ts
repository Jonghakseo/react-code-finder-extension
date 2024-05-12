import {
  currentDebugSourceStorage,
  DebugSource,
  devToolsStorage,
  ignorePathsStorage,
  injectionConfigStorage,
  MessageFromInjected,
  sendMessageToBackgroundAsync,
  tempDebugSourceStorage,
} from '@chrome-extension-boilerplate/shared';

function postMessageToInjected(type: string, data?: string) {
  return window.postMessage({ source: 'react-code-finder-to-inject', type, data }, '*');
}

export function init() {
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
        if (!devToolsStorage.checkIsOpen()) {
          alert('Please open React Code Finder in DevTools.');
          return;
        }
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

  injectionConfigStorage.get().then(injectionConfig => {
    postMessageToInjected('setConfig', JSON.stringify({ injectionConfig }));
  });
  injectionConfigStorage.onChange(injectionConfig => {
    postMessageToInjected('setConfig', JSON.stringify({ injectionConfig }));
  });
}
