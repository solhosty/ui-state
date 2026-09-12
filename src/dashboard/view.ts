import { revealScript } from './reveal.js'
import { icon } from './icons.js'
import { dashboardEnhancements } from './enhancements.js'
import { dashboardStyles } from './styles.js'

export const dashboardHtml = /* HTML */ `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Screen Explorer</title>
      <style>
        ${dashboardStyles}
      </style>
    </head>
    <body>
      <div class="app">
        <header class="topbar">
          <a class="brand" href="/" aria-label="Screen Explorer home"
            ><span class="brand-mark">${icon('brand')}</span>Screen
            Explorer<span class="local-tag">LOCAL</span></a
          ><span class="connection" id="run" role="status">Connecting</span>
        </header>
        <aside class="sidebar">
          <div class="sidebar-heading">
            <span>WORKSPACE</span><span class="tiny-label">01</span>
          </div>
          <button
            class="workspace-name"
            id="workspace-toggle"
            aria-haspopup="dialog"
            aria-label="Switch recorded workspace"
          >
            <span class="workspace-icon">${icon('workspace')}</span
            ><span class="workspace-text"
              ><strong id="app-name">Your application</strong
              ><span id="app-origin">Choose a workspace</span></span
            >${icon('chevron')}
          </button>
          <div class="section-label">Pages <span id="route-count">0</span></div>
          <nav id="routes" aria-label="Captured pages"></nav>
          <details id="source-routes" hidden>
            <summary id="source-summary">Route patterns</summary>
            <div id="source-list"></div>
          </details>
          <div class="sidebar-bottom">
            <span class="local-dot"></span> Stored on this device
            <p>Screenshots and replay evidence stay local.</p>
          </div>
        </aside>
        <main>
          <section class="commandbar">
            <form id="explore-form">
              <label class="url-label" for="explore-url">APP URL</label>
              <div class="url-control">
                <span aria-hidden="true">↗</span
                ><input
                  id="explore-url"
                  type="url"
                  required
                  placeholder="http://localhost:3000"
                  aria-label="App URL"
                  spellcheck="false"
                /><button class="primary" id="start-explore" type="submit">
                  Explore <span aria-hidden="true">↗</span>
                </button>
              </div>
            </form>
            <button
              class="secondary icon-button"
              id="advanced-toggle"
              aria-label="Exploration settings"
              title="Exploration settings"
            >
              ${icon('settings')}</button
            ><button
              class="secondary icon-button stop-button"
              id="stop-explore"
              aria-label="Stop exploration"
              title="Stop exploration"
              hidden
            >
              ${icon('stop')}
            </button>
          </section>
          <section
            class="progress-panel"
            id="progress-panel"
            hidden
            aria-label="Exploration progress"
          >
            <div class="progress-top">
              <strong id="progress-title">Exploring</strong
              ><span id="progress-elapsed"></span>
            </div>
            <div class="progress-track"><div id="progress-fill"></div></div>
            <div class="progress-bottom">
              <span id="progress-detail"></span
              ><span id="progress-count"></span>
            </div>
            <ol class="progress-steps">
              <li data-phase="discovering">Discover pages</li>
              <li data-phase="capturing">Capture screens</li>
              <li data-phase="experiments">Test states & replay</li>
            </ol>
          </section>
          <div class="activity" id="explore-progress" role="status"></div>
          <section class="page-heading">
            <div>
              <div class="eyebrow">STATE EXPLORER</div>
              <h1 id="route-title">Your screen, in every state.</h1>
              <p id="route-summary">Enter an app URL to start exploring.</p>
            </div>
            <label class="history-control"
              ><span>Evidence</span
              ><select id="run-history" aria-label="Captured runs">
                <option value="">Latest observations</option>
              </select></label
            >
          </section>
          <section class="board-toolbar">
            <div class="board-title">
              <span class="board-icon">${icon('map')}</span>
              <h2>Observed states</h2>
              <span class="count" id="state-count">0</span>
            </div>
            <div class="board-controls">
              <button
                id="play-exploration"
                class="primary reveal-launch"
                disabled
              >
                Play exploration
              </button>
              <div class="view-modes" role="group" aria-label="Workspace view">
                <button
                  id="map-view"
                  class="icon-button"
                  aria-label="Branch map"
                  title="Branch map"
                  aria-pressed="true"
                >
                  ${icon('map')}</button
                ><button
                  id="grid-view"
                  class="icon-button"
                  aria-label="Screenshot grid"
                  title="Screenshot grid"
                  aria-pressed="false"
                >
                  ${icon('grid')}</button
                ><button
                  id="fit-map"
                  class="icon-button"
                  aria-label="Fit map"
                  title="Fit map"
                >
                  ${icon('fit')}</button
                ><button
                  id="focus-map"
                  class="icon-button"
                  aria-label="Focus map"
                  title="Focus map"
                  aria-pressed="false"
                >
                  ${icon('focus')}
                </button>
              </div>
              <div
                id="viewport-tabs"
                class="segmented"
                role="group"
                aria-label="Preview viewport"
              ></div>
            </div>
          </section>
          <div id="board" class="board">
            <div class="empty">
              <span class="empty-mark">◫</span>
              <h2>A new perspective on your UI</h2>
              <p>
                Explore an app to collect real browser screenshots, then open a
                state to inspect its evidence.
              </p>
            </div>
          </div>
          <section id="unavailable" class="unavailable" hidden></section>
          <footer>
            <span id="total-states">Ready when you are</span
            ><span>Captured screens · Controlled experiments</span>
          </footer>
        </main>
      </div>
      <dialog
        id="reveal-dialog"
        class="reveal-dialog intro"
        aria-labelledby="reveal-headline"
      >
        <div class="reveal-top">
          <span class="reveal-wordmark">${icon('brand')} Screen Explorer</span
          ><span id="reveal-source"></span
          ><button
            id="reveal-close"
            class="close"
            aria-label="Close exploration presentation"
          >
            ×
          </button>
        </div>
        <div class="reveal-copy">
          <span id="reveal-kicker" class="eyebrow"></span>
          <h2 id="reveal-headline"></h2>
          <p id="reveal-description"></p>
        </div>
        <div id="reveal-scene" class="reveal-scene"></div>
        <div class="reveal-bottom">
          <span id="reveal-recorded"></span>
          <div class="reveal-actions">
            <button id="reveal-again" class="secondary" hidden>
              Watch again</button
            ><button id="reveal-inspect" class="secondary" hidden>
              Evidence details</button
            ><button id="reveal-action" class="primary">Reveal states</button
            ><button id="reveal-live" class="primary" hidden>
              Open this state ↗
            </button>
          </div>
        </div>
        <p id="reveal-feedback" class="feedback" role="status"></p>
      </dialog>
      <dialog
        id="workspaces-modal"
        class="settings-modal"
        aria-labelledby="workspaces-title"
      >
        <div class="modal-heading">
          <div>
            <span class="eyebrow">LOCAL LIBRARY</span>
            <h2 id="workspaces-title">Recorded workspaces</h2>
          </div>
          <button
            id="close-workspaces"
            class="close"
            aria-label="Close workspaces"
          >
            ×
          </button>
        </div>
        <p class="help">Each app origin has its own pages and run history.</p>
        <div id="workspace-list"></div>
      </dialog>
      <dialog id="inspector" class="inspector" aria-labelledby="inspect-title">
        <div class="inspector-heading">
          <div>
            <span class="eyebrow" id="inspect-route"></span>
            <h2 id="inspect-title"></h2>
          </div>
          <div class="inspector-actions">
            <button
              class="secondary"
              id="previous-state"
              aria-label="Previous state"
            >
              ←</button
            ><button class="secondary" id="next-state" aria-label="Next state">
              →</button
            ><button
              class="close"
              id="close-inspector"
              aria-label="Close inspector"
            >
              ×
            </button>
          </div>
        </div>
        <div class="inspector-body">
          <div class="inspect-canvas" id="inspect-image"></div>
          <aside class="evidence">
            <div class="eyebrow">OBSERVATION</div>
            <p id="inspect-condition"></p>
            <div id="inspect-status" class="evidence-status"></div>
            <dl id="inspect-facts"></dl>
            <button id="replay" class="primary">Open replay ↗</button>
            <p class="help" id="replay-hint"></p>
            <p id="replay-feedback" class="feedback" role="status"></p>
            <details>
              <summary>Evidence source</summary>
              <code id="evidence-source"></code>
            </details>
          </aside>
        </div>
        <div class="inspector-footer">
          <span id="inspect-size"></span
          ><span>Use ← → to move between states · Esc to close</span>
        </div>
      </dialog>
      <dialog
        id="advanced-modal"
        class="settings-modal"
        aria-labelledby="settings-title"
      >
        <form method="dialog" id="settings-form">
          <div class="modal-heading">
            <div>
              <span class="eyebrow">EXPLORATION</span>
              <h2 id="settings-title">Capture settings</h2>
            </div>
            <button
              class="close"
              value="cancel"
              aria-label="Close settings"
              formnovalidate
            >
              ×
            </button>
          </div>
          <p class="help">Choose how far to explore your application.</p>
          <label
            >Source folder
            <span>Optional · discover routes not linked on the page</span
            ><input id="source-folder" placeholder="/path/to/your/app" /></label
          ><label
            >Page limit <span>Leave blank to explore all discovered pages</span
            ><input
              id="page-limit"
              type="number"
              min="1"
              step="1"
              placeholder="No limit" /></label
          ><label
            >API response matcher
            <span>Optional · URL fragment for the JSON collection to vary</span
            ><input id="request-matcher" placeholder="/api/items" /></label
          ><label
            >Retry control
            <span
              >Optional · CSS selector; otherwise discover a visible retry
              button</span
            ><input id="retry-selector" placeholder="[data-testid=retry]"
          /></label>
          <div class="modal-actions">
            <button class="secondary" value="cancel" formnovalidate>
              Cancel</button
            ><button class="primary" value="save">Save settings</button>
          </div>
        </form>
      </dialog>
      <script>
        ${dashboardEnhancements}
        ${revealScript}
      </script>
    </body>
  </html>`
