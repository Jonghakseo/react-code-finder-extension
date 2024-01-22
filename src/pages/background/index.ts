import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

reloadOnUpdate('pages/background');

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: '#888' });
});

chrome.action.onClicked.addListener(async tab => {
  const tabText = await chrome.action.getBadgeText({ tabId: tab.id });
  switch (tabText) {
    case 'ON':
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#888' });
      chrome.tabs.sendMessage(tab.id, { type: 'toggleOff' });

      break;
    case 'OFF':
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
      chrome.tabs.sendMessage(tab.id, { type: 'toggleOn' });
      break;
    default:
      break;
  }
});

chrome.runtime.onConnect.addListener(port => {
  port.onDisconnect.addListener(() => console.log('Port disconnected'));

  port.onMessage.addListener(async message => {
    console.log('port message', message);
    switch (message.type) {
      case 'getCurrentState': {
        const tabText = await chrome.action.getBadgeText({ tabId: message.tabId });
        port.postMessage({ type: 'getCurrentState', data: tabText });
        break;
      }
      default:
        break;
    }
  });
});
