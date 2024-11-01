import { devToolsStorage } from '@chrome-extension-boilerplate/shared';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'devtools-health-check': {
      sendResponse('ok');
      break;
    }
  }
});

try {
  chrome.devtools.panels.create('React Code Finder', 'icon-34.png', 'devtools-panel/index.html', panel => {
    panel.onHidden.addListener(() => {
      devToolsStorage.hide();
      chrome.runtime.sendMessage({ type: 'toggleOff' });
    });
    panel.onShown.addListener(() => {
      devToolsStorage.show();
      chrome.runtime.sendMessage({ type: 'toggleOn' });
    });
  });
} catch (e) {
  console.error(e);
}
