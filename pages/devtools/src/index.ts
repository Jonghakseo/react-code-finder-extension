try {
  chrome.devtools.panels.create('React Code Finder', 'icon-34.png', 'devtools-panel/index.html');
} catch (e) {
  console.error(e);
}
