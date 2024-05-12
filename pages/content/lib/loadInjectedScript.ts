export default async function loadInjectedScript() {
  return new Promise<void>(resolve => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('content-injected/index.iife.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = function () {
      script.remove();
      resolve();
    };
  });
}
