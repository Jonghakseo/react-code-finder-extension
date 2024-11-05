import 'webextension-polyfill';

let isInitialized = false;

if (!isInitialized) {
  isInitialized = true;
  initialize();
}

function initialize() {
  chrome.storage.session.setAccessLevel({
    accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS',
  });
  chrome.action.setBadgeText({ text: 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: '#888' });

  chrome.tabs.getCurrent().then(tab => {
    tab?.id && chrome.tabs.sendMessage(tab.id, { type: 'toggleOff' });
  });
}

chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

const toggleOn = (tabId: number) => {
  chrome.action.setBadgeText({ text: 'ON' });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
  chrome.tabs.sendMessage(tabId, { type: 'toggleOn' });
};

const toggleOff = (tabId: number) => {
  chrome.action.setBadgeText({ text: 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: '#888' });
  chrome.tabs.sendMessage(tabId, { type: 'toggleOff' });
};

chrome.runtime.onMessage.addListener(message => {
  switch (message.type) {
    case 'toggleOff': {
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        tab?.id && toggleOff(tab.id);
      });
      break;
    }
    case 'toggleOn': {
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        tab?.id && toggleOn(tab.id);
      });
      break;
    }
  }
});

chrome.action.onClicked.addListener(async tab => {
  const tabId = tab.id;
  if (!tabId) {
    return;
  }
  const tabText = await chrome.action.getBadgeText({ tabId });
  switch (tabText) {
    case 'ON':
      toggleOff(tabId);
      break;
    case 'OFF':
      toggleOn(tabId);
      break;
    default:
      break;
  }
});

chrome.runtime.onConnect.addListener(port => {
  port.onDisconnect.addListener(() => console.log('Port disconnected'));

  port.onMessage.addListener(async message => {
    switch (message.type) {
      case 'getCurrentState': {
        const tabText = await chrome.action.getBadgeText({ tabId: message.tabId });
        port.postMessage({ type: 'getCurrentState', data: tabText });
        break;
      }
    }
  });
});
