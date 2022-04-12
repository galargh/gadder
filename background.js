chrome.runtime.onInstalled.addListener((_details) => {
  chrome.tabs.create({
    url: 'README.html'
  });
});
