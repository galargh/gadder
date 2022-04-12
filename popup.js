function renderRun(run) {
  const startTime = new Date(run.startTime).toLocaleDateString() === new Date().toLocaleDateString() ?
    new Date(run.startTime).toLocaleTimeString() :
    new Date(run.startTime).toLocaleDateString();
  const duration = run.endTime ?
    run.endTime - run.startTime :
    Date.now() - run.startTime;
  var status = run.status;
  if (run.status === 'In Progress') {
    if (run.items) {
      status = `Fetching (${run.items.fetched}/${run.items.count})`;
    }
  }
  return `
  <div class="Box-row" data-run-id="${run.id}">
    <div class="d-table col-12">
      <div class="d-table-cell v-align-top col-11 col-md-10 pl-4 position-relative">
        <div class="position-absolute left-0 checks-list-item-icon text-center">
          <div title="${run.status}" class="d-flex flex-items-center flex-justify-center">
            <svg width="16" height="16" style="margin-top: 2px" class="octicon octicon-dot-fill hx_dot-fill-pending-icon" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path></svg>
          </div>
        </div>

        <span class="h4 d-inline-block text-bold lh-condensed mb-1 width-full css-truncate css-truncate-target">
          ${run.name}
        </span>

        <span class="d-block text-small color-fg-muted mb-1 mb-md-0">
          <span class="text-bold">Query:</span>
          <span class="color-fg-muted">
            ${run.query}
          </span>
        </span>

        <span class="d-block text-small color-fg-muted mb-1 mb-md-0">
          <span class="text-bold">Status:</span>
          <span class="color-fg-muted">
            ${run.status}
          </span>
        </span>

        <div class="d-block d-md-none text-small">
          <span class="d-inline d-md-block lh-condensed color-fg-muted my-1 pr-2 pr-md-0" title="Start time">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-calendar">
              <path fill-rule="evenodd" d="M4.75 0a.75.75 0 01.75.75V2h5V.75a.75.75 0 011.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 16H2.75A1.75 1.75 0 011 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 014.75 0zm0 3.5h8.5a.25.25 0 01.25.25V6h-11V3.75a.25.25 0 01.25-.25h2zm-2.25 4v6.75c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V7.5h-11z"></path>
            </svg>
            <span>${startTime}</span>
          </span>

          <span class="d-inline d-md-block lh-condensed pr-2 pr-md-0" title="Run duration">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-stopwatch color-fg-muted">
              <path fill-rule="evenodd" d="M5.75.75A.75.75 0 016.5 0h3a.75.75 0 010 1.5h-.75v1l-.001.041a6.718 6.718 0 013.464 1.435l.007-.006.75-.75a.75.75 0 111.06 1.06l-.75.75-.006.007a6.75 6.75 0 11-10.548 0L2.72 5.03l-.75-.75a.75.75 0 011.06-1.06l.75.75.007.006A6.718 6.718 0 017.25 2.541a.756.756 0 010-.041v-1H6.5a.75.75 0 01-.75-.75zM8 14.5A5.25 5.25 0 108 4a5.25 5.25 0 000 10.5zm.389-6.7l1.33-1.33a.75.75 0 111.061 1.06L9.45 8.861A1.502 1.502 0 018 10.75a1.5 1.5 0 11.389-2.95z"></path>
            </svg>
            <span>${duration}</span>
          </span>
        </div>
      </div>

      <div class="d-table-cell v-align-middle col-1 col-md-3 text-small">
        <div class="d-flex flex-justify-between flex-items-center">
          <div class="d-none d-md-block">
            <span class="d-inline d-md-block lh-condensed color-fg-muted my-1 pr-2 pr-md-0" title="Start time">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-calendar">
                <path fill-rule="evenodd" d="M4.75 0a.75.75 0 01.75.75V2h5V.75a.75.75 0 011.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 16H2.75A1.75 1.75 0 011 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 014.75 0zm0 3.5h8.5a.25.25 0 01.25.25V6h-11V3.75a.25.25 0 01.25-.25h2zm-2.25 4v6.75c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V7.5h-11z"></path>
              </svg>
              <span>${startTime}</span>
            </span>

            <span class="d-inline d-md-block lh-condensed pr-2 pr-md-0" title="Run duration">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-stopwatch color-fg-muted">
                <path fill-rule="evenodd" d="M5.75.75A.75.75 0 016.5 0h3a.75.75 0 010 1.5h-.75v1l-.001.041a6.718 6.718 0 013.464 1.435l.007-.006.75-.75a.75.75 0 111.06 1.06l-.75.75-.006.007a6.75 6.75 0 11-10.548 0L2.72 5.03l-.75-.75a.75.75 0 011.06-1.06l.75.75.007.006A6.718 6.718 0 017.25 2.541a.756.756 0 010-.041v-1H6.5a.75.75 0 01-.75-.75zM8 14.5A5.25 5.25 0 108 4a5.25 5.25 0 000 10.5zm.389-6.7l1.33-1.33a.75.75 0 111.061 1.06L9.45 8.861A1.502 1.502 0 018 10.75a1.5 1.5 0 11.389-2.95z"></path>
              </svg>
              <span>${duration}</span>
            </span>
          </div>

          <div class="text-right">
            <details class="details-overlay details-reset position-relative d-inline-block ">
              <summary aria-haspopup="menu" data-view-component="true" class="timeline-comment-action btn-link">
                <svg aria-label="Show options" aria-hidden="false" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-kebab-horizontal">
                  <path d="M8 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM1.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                </svg>
              </summary>
              <ul class="dropdown-menu dropdown-menu-sw show-more-popover color-fg-default anim-scale-in" style="width: 185px">
                <li>
                  <form>
                    <button class="dropdown-item btn-link btn-danger" value="${run.id}">
                      Delete Run
                    </button>
                  </form>
                </li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>`
}

window.addEventListener('DOMContentLoaded', () => {
  const searchContainer = document.querySelector('input[id="search"]');
  const runsContainer = document.querySelector('div[id="runs"]');
  const countContainer = document.querySelector('span[id="count"]');

  function syncRuns() {
    chrome.runtime.sendMessage({
      from: 'popup',
      subject: 'getRuns',
    }, runs => {
      runsContainer.innerHTML = runs.map(renderRun).reverse().join('\n');
      countContainer.innerHTML = runs.length;
    });
  }

  syncRuns(runsContainer, countContainer);
  chrome.storage.onChanged.addListener((_changes, _namespace) => {
    syncRuns(runsContainer, countContainer);
  });

  runsContainer.addEventListener('submit', event => {
    event.preventDefault();

    chrome.runtime.sendMessage({
      from: 'popup',
      subject: 'deleteRun',
      payload: {
        id: event.target[0].value
      }
    });
  });

  searchContainer.addEventListener('keypress', function(event) {
    if (event.key == 'Enter') {
      event.preventDefault();
      searchContainer.disabled = true;
      chrome.tabs.query({active: true, currentWindow: true})
        .then(tabs => chrome.tabs.sendMessage(tabs[0].id, {
          from: 'popup',
          subject: 'addProjectItems',
          payload: {
            query: search.value
          }
        })).then((run) => {
          const waitForRun = setInterval(() => {
            if (runsContainer.querySelector(`[data-run-id="${run.id}"]`)) {
              clearInterval(waitForRun);
              searchContainer.value = '';
              searchContainer.disabled = false;
            }
          }, 1000);
        });
    }
  });
});
