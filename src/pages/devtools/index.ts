try {
  chrome.devtools.panels.create('React Code Finder', 'icon-34.png', 'src/pages/panel/index.html');
} catch (e) {
  console.error(e);
}
