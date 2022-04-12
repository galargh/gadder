const runs = {};
const projectDetails = JSON.parse(document.getElementById('memex-item-create-api-data').innerHTML)
projectDetails.name = document.getElementById('memexTitleInput').value

async function search(run) {
  const allResults = [];

  var next = 'https://github.com/search?p=1&q=' + encodeURIComponent(run.query) + '&type=Issues';
  while(next) {
    const response = await fetch(next).catch(console.log);
    const html = await response.text();
    const element = new DOMParser().parseFromString(html, 'text/html');
    const results = element.querySelector('[id="issue_search_results"]');
    results.querySelectorAll('div.markdown-title a').forEach(a => {
      allResults.push(a.href);
    });
    const nextLink = element.querySelector('[rel="next"]');
    next = nextLink && nextLink.href;
    run.items = {
      count: Array.from(element.querySelector('div.codesearch-results h3').textContent.matchAll('\\d'), m => m[0]).join(''),
      fetched: allResults.length
    };
    chrome.runtime.sendMessage({
      from: 'content',
      subject: 'updateRun',
      payload: run
    });
  }

  return allResults;
}

async function add(issues) {
  const allResponses = [];

  for (let issueIndex = 0; issueIndex < issues.length; issueIndex++) {
    const issue = issues[issueIndex];
    const response = await fetch(projectDetails.url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        'scoped-csrf-token': projectDetails.token,
      },
      body: [
        encodeURIComponent('memexProjectItem[contentType]') + '=' + encodeURIComponent('DraftIssue'),
        encodeURIComponent('memexProjectItem[content][title]') + '=' + encodeURIComponent(issue),
        encodeURIComponent('memexProjectItem[memexProjectColumnValues][]')
      ].join('&').replace(/%20/g, '+'),
    }).catch(console.log);

    allResponses.push(response);
  }

  return allResponses;
}

chrome.runtime.onMessage.addListener(function(msg, _sender, sendResponse) {
  if (msg.from === 'popup' && msg.subject === 'addProjectItems') {
    const run = {
      id: crypto.randomUUID(),
      status: 'In Progress',
      name: projectDetails.name,
      query: msg.payload.query,
      startTime: Date.now()
    };
    chrome.runtime.sendMessage({
      'from': 'content',
      'subject': 'addRun',
      'payload': run
    });
    runs[run.id] = search(run).then(add).then(responses => {
      console.log(responses);
      run.status = 'Completed';
      chrome.runtime.sendMessage({
        from: 'content',
        subject: 'updateRun',
        payload: run
      });
    });
    sendResponse(run);
  }
  if (msg.from === 'background' && msg.subject === 'deleteRun') {
    const run = msg.payload;
  }
});

chrome.runtime.sendMessage({
  from: 'content',
  subject: 'enablePopup',
});
