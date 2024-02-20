import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

reloadOnUpdate('pages/background');

let isInitialized = false;

if (!isInitialized) {
  isInitialized = true;
  initialize();
}

function initialize() {
  chrome.action.setBadgeText({ text: 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: '#888' });

  chrome.tabs.getCurrent().then(tab => {
    tab?.id && chrome.tabs.sendMessage(tab.id, { type: 'toggleOff' });
  });
}

chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

chrome.action.onClicked.addListener(async tab => {
  const tabId = tab.id;
  if (!tabId) {
    return;
  }
  const tabText = await chrome.action.getBadgeText({ tabId });
  switch (tabText) {
    case 'ON':
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#888' });
      chrome.tabs.sendMessage(tabId, { type: 'toggleOff' });
      break;
    case 'OFF':
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
      chrome.tabs.sendMessage(tabId, { type: 'toggleOn' });
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
      case 'openSidePanel': {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          tab?.id && chrome.sidePanel.open({ tabId: tab.id });
        });
        break;
      }
    }
  });
});
