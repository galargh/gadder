chrome.runtime.onInstalled.addListener((_details) => {
  chrome.action.disable()
  chrome.tabs.create({
    url: 'README.md'
  });
});


chrome.storage.sync.get(['runs'], result => {
  const runs = result.runs || [];

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.from === 'content' && msg.subject === 'enablePopup') {
      chrome.action.enable(sender.tab.id);
      sendResponse();
    }
    if (msg.from === 'content' && msg.subject === 'addRun') {
      const run = msg.payload;
      run.tabId = sender.tab.id;
      runs.push(run);
      chrome.storage.sync.set({runs: runs});
      sendResponse(run);
    }
    if (msg.from === 'popup' && msg.subject === 'getRuns') {
      sendResponse(runs);
    }
    if (msg.from === 'popup' && msg.subject === 'deleteRun') {
      const id = msg.payload.id;
      const runIndex = runs.findIndex(run => run.id === id);
      const run = runs[runIndex];
      chrome.tabs.sendMessage(run.tabId, {
        from: 'background',
        subject: 'deleteRun',
        payload: run
      });
      runs.splice(runIndex, 1);
      chrome.storage.sync.set({runs: runs});
      sendResponse();
    }
    if (msg.from === 'content' && msg.subject === 'updateRun') {
      const id = msg.payload.id;
      const runIndex = runs.findIndex(run => run.id === id);
      runs[runIndex] = msg.payload;
      chrome.storage.sync.set({runs: runs});
      sendResponse();
    }
  });
});
