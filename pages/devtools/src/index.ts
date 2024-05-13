import { devToolsStorage } from '@chrome-extension-boilerplate/shared';

try {
  chrome.devtools.panels.create('React Code Finder', 'icon-34.png', 'devtools-panel/index.html', panel => {
    panel.onHidden.addListener(() => {
      devToolsStorage.hide();
    });
    panel.onShown.addListener(() => {
      devToolsStorage.show();
    });
  });
} catch (e) {
  console.error(e);
}
