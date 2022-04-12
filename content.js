const projectDetails = JSON.parse(document.getElementById('memex-item-create-api-data').innerHTML)
const repoSearcherInput = document.querySelector('input[data-test-id="repo-searcher-input"]');
const repoSearcherList = document.querySelector('ul[data-test-id="repo-searcher-list"]');
const newItemButton = document.querySelector('button[data-test-id="new-item-button"]');

function parseHTML(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function getGadderRepoSearcherList() {
  let gadderRepoSearcherList = document.querySelector('ul[data-test-id="gadder-repo-searcher-list"]');
  if (! gadderRepoSearcherList) {
    gadderRepoSearcherList = parseHTML(`
      <ul data-test-id="gadder-repo-searcher-list" class="${repoSearcherList.className}" hidden></ul>
    `).body.firstChild;
    repoSearcherList.parentElement.append(gadderRepoSearcherList);
  }
  return gadderRepoSearcherList;
}

async function searchIssues(url) {
  const response = await fetch(url);
  const html = await response.text();
  const element = parseHTML(html);
  const count = Array.from(element.querySelector('div.codesearch-results h3').textContent.matchAll('\\d'), m => m[0]).join('');
  const counter = element.querySelector('span[data-search-type="Issues"]')
  const issues = [];
  element.querySelectorAll('div[id="issue_search_results"] div.issue-list-item').forEach(div => {
    const a = div.querySelector('div.markdown-title a');
    issues.push({
      svg: div.querySelector('svg').outerHTML,
      title: a.title,
      href: a.href
    });
  });
  const next = element.querySelector('[rel="next"]');
  return {
    count: count,
    counter: counter,
    issues: issues,
    next: next && next.href
  };
}

async function searchIssuesPaginated(query) {
  const allIssues = [];

  let next = 'https://github.com/search?p=1&q=' + encodeURIComponent(query) + '&type=Issues';
  while(next) {
    const issues = await searchIssues(next);
    allIssues.push(...issues.issues);
    next = issues.next;
    console.log(`Found ${allIssues.length} out of ${issues.count} issues`);
  }

  return allIssues;
}


function showGadderRepoSearcherList(query) {
  searchIssues('https://github.com/search?p=1&q=' + encodeURIComponent(query) + '&type=Issues').then(response => {
    const gadderRepoSearcherList = getGadderRepoSearcherList();
    gadderRepoSearcherList.replaceChildren(...response.issues.map(issue => {
      return parseHTML(`
        <li style="cursor: pointer; display: block; font-size: 12px; padding: 8px;">
          <div style="-webkit-box-align: center; align-items: center; overflow: hidden; flex: 1 1 0%; display: flex;">
            <div style="flex-shrink: 0; margin-right: 8px; display: flex;">
              ${issue.svg}
            </div>
            <span>${issue.title}</span>
            <a target="_blank" href="${issue.href}" style="margin-left: 4px; color: rgb(87, 96, 106);">#${issue.href.split('/').reverse()[0]}</a>
          </div>
        </li>
      `).body.firstChild;
    }));
    gadderRepoSearcherList.appendChild(parseHTML(`
      <li style="cursor: pointer; display: block; font-size: 12px; padding: 8px;">
        <div style="-webkit-box-align: center; align-items: center; overflow: hidden; flex: 1 1 0%; display: flex;">
          <div title="${response.count}" style="flex-shrink: 0; margin-right: 8px; display: flex;">
            ${response.counter.outerHTML}
          </div>
          <span id="query">${query}</span>
        </div>
      </li>`).body.firstChild);
    gadderRepoSearcherList.hidden = false;
    const repoSearcherInputRect = repoSearcherInput.getBoundingClientRect();
    const gadderRepoSearcherListRect = gadderRepoSearcherList.getBoundingClientRect();
    gadderRepoSearcherList.setAttribute('style', `left: ${repoSearcherInputRect.left}px; top: ${repoSearcherInputRect.top - gadderRepoSearcherListRect.height}px;`);
  });
}

function debounce(callback, delay) {
  let timeout;
  return () =>{
    clearTimeout(timeout);
    timeout = setTimeout(callback, delay);
  }
}

repoSearcherInput.addEventListener('keyup', debounce(() => {
  const query = repoSearcherInput.value;
  if (query.startsWith('q=') && query.length > 2) {
    showGadderRepoSearcherList(query.substr(2));
  } else {
    getGadderRepoSearcherList().hidden = true;
  }
}, 1000));

async function addItem(url) {
  console.log(`Adding item from ${url}`);
  const response = await fetch(projectDetails.url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      'scoped-csrf-token': projectDetails.token,
    },
    body: [
      encodeURIComponent('memexProjectItem[contentType]') + '=' + encodeURIComponent('DraftIssue'),
      encodeURIComponent('memexProjectItem[content][title]') + '=' + encodeURIComponent(url),
      encodeURIComponent('memexProjectItem[memexProjectColumnValues][]')
    ].join('&').replace(/%20/g, '+'),
  });
  console.log(`Response: ${response.status}`);
  return response;
}

repoSearcherList.parentElement.addEventListener('click', event => {
  if (event.target.name !== 'a') {
    const gadderRepoSearcherList = getGadderRepoSearcherList();
    const gadderRepoSearcherListItem = Array.from(gadderRepoSearcherList.querySelectorAll('li')).find(li => li.contains(event.target));
    if (gadderRepoSearcherListItem) {
      event.preventDefault();
      gadderRepoSearcherList.hidden = true;
      repoSearcherInput.disabled = true;
      newItemButton.disabled = true;
      const a = gadderRepoSearcherListItem.querySelector('a');
      if (a) {
        addItem(a.href).then(response => {
          newItemButton.disabled = false;
          repoSearcherInput.disabled = false;
          gadderRepoSearcherList.hidden = false;
        });
      } else {
        searchIssuesPaginated(gadderRepoSearcherListItem.querySelector('span[id="query"]').textContent).then(async issues => {
          const allResponses = [];

          for (let issueIndex = 0; issueIndex < issues.length; issueIndex++) {
            const issue = issues[issueIndex];
            const response = await addItem(issue.href);
            allResponses.push(response);
            console.log(`Added ${allResponses.length} out of ${issues.length} issues`);
          }

          return allResponses;
        }).then(responses => {
          newItemButton.disabled = false;
          repoSearcherInput.disabled = false;
          gadderRepoSearcherList.hidden = false;
        });
      }
    }
  }
});
