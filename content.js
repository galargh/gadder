function parseHTML(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function renderNode(html) {
  return parseHTML(html).body.firstChild;
}

function debounce(callback, delay){
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => { callback.apply(this, args); }, delay);
  };
}

function capitalize(string) {
  return `${string.substr(0,1).toUpperCase()}${string.substr(1)}`
}

const memexItemCreateAPIData = JSON.parse(document.getElementById('memex-item-create-api-data').innerHTML)
const memexData = JSON.parse(document.getElementById('memex-data').innerHTML);
const memexOwner = JSON.parse(document.getElementById('memex-owner').innerHTML);
const memexColumnsData = JSON.parse(document.getElementById('memex-columns-data').innerHTML);

const liveUpdateListener = document.querySelector('.js-socket-channel[data-test-id="live-update-listener"]');
const dataChannel = liveUpdateListener.getAttribute('data-channel');
const [dataChannelContent, dataChannelSignature] = dataChannel.split('--');
const dataChannelSubscription = JSON.parse(atob(dataChannelContent));
const projectItemCreateEvent = new CustomEvent('socket:message', {
  bubbles: false,
  cancelable: false,
  detail: {
    name: dataChannelSubscription.c,
    data: {
      type: 'github.memex.v0.ProjectItemCreate',
      wait: 0
    },
    cached: false
  }
});

const portalRoot = document.getElementById('portal-root');
const gadderIcon = chrome.runtime.getURL('images/gadder64.png')

const STATE = {
  repoSearcherInput: null,
  phase: 'select', // 'search', 'select', 'fetch', 'add'
  issues: [],
  complete: 0,
  total: 0,
}

const issueSearcherList = renderNode(`<div class='SelectMenu' style='visibility: hidden;'><div class='SelectMenu-modal m-0'><ul class="SelectMenu-list SelectMenu-list--borderless"></ul></div></div>`)
portalRoot.appendChild(issueSearcherList);

async function searchIssues(url) {
  const response = await fetch(url);
  const html = await response.text();
  const element = parseHTML(html);
  const count = element.querySelector('div[id="issue_search_results"]') ? Array.from(element.querySelector('div.codesearch-results h3').textContent.matchAll('\\d'), m => m[0]).join('') : 0;
  const issues = [];

  element.querySelectorAll('div[id="issue_search_results"] div.issue-list-item').forEach(div => {
    const a = div.querySelector('div.markdown-title a');
    issues.push({
      title: a.title,
      href: a.href,
      octiconHTML: div.querySelector('svg').outerHTML
    });
  });

  const next = element.querySelector('[rel="next"]');

  return {
    count: count || 0,
    issues: issues,
    next: next && next.href
  };
}

async function searchIssuesPreview() {
  const query = `${STATE.repoSearcherInput.value.substr(2)} -project:${memexOwner.name}/${memexData.number}`;

  STATE.phase = 'search';
  STATE.complete = 0;
  STATE.total = '<span class="AnimatedEllipsis"></span>';
  STATE.query = query;
  showIssueSearcherList();

  return searchIssues('https://github.com/search?p=1&q=' + encodeURIComponent(query) + '&type=Issues').then(response => {
    console.log(response);

    STATE.phase = 'select';
    STATE.issues = response.issues;
    STATE.total = response.count;
    showIssueSearcherList();
  });
}

async function searchIssuesPaginated(query) {
  const allIssues = [];

  STATE.phase = 'fetch';
  STATE.complete = 0;
  showIssueSearcherList();

  let next = 'https://github.com/search?p=1&q=' + encodeURIComponent(query) + '&type=Issues';
  while(next) {
    const issues = await searchIssues(next);
    allIssues.push(...issues.issues);
    next = issues.next;
    console.log(`Found ${allIssues.length} out of ${issues.count} issues`);

    STATE.complete = allIssues.length;
    updateStateElement('complete');
  }

  return allIssues;
}

function updateStateElement(stateKey) {
  const stateValue = STATE[stateKey];
  document.querySelectorAll(`[state-key="${stateKey}"]`).forEach(element => {
    element.innerHTML = stateValue;
  });
}

function showIssueSearcherList() {
  const children = [];
  const headerHTML = renderNode(`
    <header class="SelectMenu-header">
      <h3 class="SelectMenu-title">${STATE.query}</h3>
    </header>
  `);
  children.push(headerHTML);
  if (STATE.phase == 'select') {
    const issueHTMLs = STATE.issues.map(issue => {
      return renderNode(`
        <li class='SelectMenu-item flex-justify-between' data-type='link' data='${issue.href}'>
          <span>
            ${issue.octiconHTML}
            <span class="mx-2">${issue.title}</span>
          </span>
          <a target="_blank" href="${issue.href}">#${issue.href.split('/').reverse()[0]}</a>
        </li>
      `);
    });
    children.push(...issueHTMLs);
    if (STATE.total > 0) {
      const dividerHTML = renderNode(`<hr class="SelectMenu-divider"></hr>`);
      const queryHTML = renderNode(`
        <li class='SelectMenu-item' data-type='query' data='${STATE.query}'>
          <div>
            <h5>Add all ${STATE.total} issues</h5>
          </div>
        </li>`
      );
      children.push(dividerHTML, queryHTML);
    }
    const footerHTML = renderNode(`
      <footer class="SelectMenu-footer">Showing ${STATE.issues.length} of ${STATE.total} issues</footer>
    `);
    children.push(footerHTML);
  } else {
    const loaderHTML = renderNode(`
      <div class="SelectMenu-loading">
        <img style="width: 64px; height: 64px;" src="${gadderIcon}" class="${STATE.complete === STATE.total ? '' : 'anim-rotate'}"></img>
      </div>
    `);
    const footerHTML = renderNode(`
      <footer class="SelectMenu-footer">
        <span ${STATE.complete === STATE.total ? 'hidden' : ''}>${capitalize(STATE.phase)}ing</span>
        <span class="AnimatedEllipsis" ${STATE.complete === STATE.total ? 'hidden' : ''}></span>
        <span>${capitalize(STATE.phase)}ed <span state-key="complete">${STATE.complete}</span> of ${STATE.total} issues</span>
      </footer>
    `)
    children.push(loaderHTML, footerHTML);
  }
  issueSearcherList.querySelector('ul').replaceChildren(...children);
  issueSearcherList.hidden = false;
  const repoSearcherInputRect = STATE.repoSearcherInput.getBoundingClientRect();
  const issueSearcherListRect = issueSearcherList.getBoundingClientRect();
  issueSearcherList.setAttribute('style', `visibility: visible; max-height: ${repoSearcherInputRect.top}px; left: ${repoSearcherInputRect.left}px; top: ${repoSearcherInputRect.top - issueSearcherListRect.height}px;`);
}

function hideIssueSearcherList() {
  issueSearcherList.setAttribute('style', 'visibility: hidden;');
  issueSearcherList.hidden = true;
}

function getProjectColumnValues() {
  if (document.querySelector('[data-test-id="board-view"]')) {
    const columnValueId = document.querySelector('[data-test-id="board-view-add-card-indicator"]')
      .closest('[data-test-id="board-view-column"]')
      .getAttribute('id');
    const columnId = memexColumnsData.find(column => {
      return column.settings?.options?.find(option => {
        return option.id === columnValueId;
      });
    }).id;
    return {
      memexProjectColumnId: columnId,
      value: columnValueId,
    }
  }
  // table view
  if (document.querySelector('[data-test-id^="grouped-label-"]')) {
    const columnId = document.querySelector('[data-test-id^="grouped-label-"]')
      .getAttribute('data-test-id')
      .substr('grouped-label-'.length);
    const columnValueName = STATE.repoSearcherInput.closest('[data-test-id^="table-group-footer-"]')
      .getAttribute('data-test-id')
      .substr('table-group-footer-'.length);
    if (columnValueName) {
      const columnValue = memexColumnsData.find(column => {
        return column.id === columnId;
      }).settings.options.find(option => {
        return option.name === columnValueName;
      });
      if (columnValue) {
        return {
          memexProjectColumnId: columnId,
          value: columnValue.id,
        }
      }
    }
  }
  return null;
}

async function createProjectItem(link, projectColumnValues) {
  console.log(`Adding item from ${link}`);
  const body = [
    encodeURIComponent('memexProjectItem[contentType]') + '=' + encodeURIComponent('DraftIssue'),
    encodeURIComponent('memexProjectItem[content][title]') + '=' + encodeURIComponent(link),
  ]
  if (projectColumnValues) {
    body.push(
      encodeURIComponent('memexProjectItem[memexProjectColumnValues][][memexProjectColumnId]') + '=' + encodeURIComponent(projectColumnValues.memexProjectColumnId),
      encodeURIComponent('memexProjectItem[memexProjectColumnValues][][value]') + '=' + encodeURIComponent(projectColumnValues.value),
    );
  }
  const response = await fetch(memexItemCreateAPIData.url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      'scoped-csrf-token': memexItemCreateAPIData.token,
    },
    body: body.join('&').replace(/%20/g, '+'),
  });
  console.log(`Response: ${response.status}`);
  return response;
}

async function createProjectItemsSequentially(issues, projectColumnValues) {
  const allResponses = [];

  STATE.phase = 'add';
  STATE.complete = 0;
  STATE.total = issues.length;
  showIssueSearcherList();

  for (let issueIndex = 0; issueIndex < issues.length; issueIndex++) {
    const issue = issues[issueIndex];
    const response = await createProjectItem(issue.href, projectColumnValues);
    allResponses.push(response);
    console.log(`Added ${allResponses.length} out of ${issues.length} issues`);

    STATE.complete = allResponses.length;
    updateStateElement('complete');
  }

  showIssueSearcherList();

  return allResponses;
}

async function addIssues(issueSearcherListItem) {
  const data = issueSearcherListItem.getAttribute('data');
  const dataType = issueSearcherListItem.getAttribute('data-type');
  const projectColumnValues = getProjectColumnValues();

  if (dataType === 'query') {
    return searchIssuesPaginated(data)
      .then(issues => {
        return createProjectItemsSequentially(issues, projectColumnValues)
      });
  } else if (dataType === 'link') {
    return createProjectItemsSequentially([{href: data}], projectColumnValues);
  }
}

function setRepoSearcherInput(repoSearcherInput) {
  STATE.repoSearcherInput = repoSearcherInput;

  if (STATE.phase == 'select' || STATE.phase == 'search' || (STATE.phase == 'add' && STATE.complete === STATE.total)) {
    searchIssuesPreview();
  } else {
    showIssueSearcherList();
  }
}

document.addEventListener('input', debounce(event => {
  if (event.target.getAttribute('data-test-id') === 'repo-searcher-input') {
    if (event.target.value.startsWith('q=')) {
      setRepoSearcherInput(event.target);
    } else {
      hideIssueSearcherList();
    }
  }
}, 300));

document.addEventListener('click', event => {
  if (event.target.getAttribute('data-test-id') === 'repo-searcher-input' && event.target.value.startsWith('q=')) {
    setRepoSearcherInput(event.target);
  } else if (issueSearcherList.contains(event.target)) {
    if (event.target.tagName !== 'A') {
      const issueSearcherListItem = event.target.closest('li');
      if (issueSearcherListItem) {
        addIssues(issueSearcherListItem).then(() => {
          liveUpdateListener.dispatchEvent(projectItemCreateEvent);
          setTimeout(() => {
            searchIssuesPreview();
          }, 3000);
        });
      }
    }
  } else {
    hideIssueSearcherList();
  }
});

window.addEventListener('resize', event => {
  hideIssueSearcherList();
});
