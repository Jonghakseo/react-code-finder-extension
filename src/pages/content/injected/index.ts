import('@pages/content/injected/injectEventHandler');

const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/pages/inject/index.js');
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
  script.remove();
};
