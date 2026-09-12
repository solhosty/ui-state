import { iconPaths } from './icons.js'
/** Dashboard interactions use the evidence library directly; no global fetch patches. */
export const dashboardEnhancements =
  `const iconPaths = ${JSON.stringify(iconPaths)};\n` +
  String.raw`
const icon = (name) =>
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  iconPaths[name] +
  '</svg>'
const $ = (id) => document.getElementById(id)
const make = (parent, tag, text, className) => {
  const node = document.createElement(tag)
  if (text !== undefined) node.textContent = text
  if (className) node.className = className
  parent.append(node)
  return node
}
let library,
  routeId,
  stateId,
  viewportId = 'desktop',
  selectedRun = '',
  targetUrl = '',
  lastPayload = '',
  refreshing = false,
  busy = false,
  replaying = false
let mapMode = true,
  boardKey = '',
  progressStarted
let settings = {
  sourceDirectory: '',
  maxPages: '',
  requestUrl: '',
  retrySelector: '',
}
const routes = () => library?.routes || []
const activeRoute = () => routes().find((route) => route.id === routeId)
const observations = () => activeRoute()?.observations || []
const activeState = () => observations().find((state) => state.id === stateId)
const previews = (state) =>
  state.previews?.length
    ? state.previews
    : state.screenshot
      ? [
          {
            viewport: {
              id: 'desktop',
              label: 'Desktop',
              width: 1440,
              height: 960,
            },
            screenshot: state.screenshot,
          },
        ]
      : []
const preview = (state) =>
  previews(state).find((item) => item.viewport.id === viewportId)
const captured = () => observations().filter((state) => previews(state).length)
const imagePath = (state, shot) =>
  '/artifacts/runs/' +
  encodeURIComponent(state.evidenceRunId || library.runId) +
  '/' +
  shot.screenshot.split('/').map(encodeURIComponent).join('/')
const stateName = (state) =>
  ({
    baseline: 'Baseline',
    loading: 'Loading',
    empty: 'Empty collection',
    failed: 'Request failed',
    recovered: 'Recovered',
  })[state.id] ||
  state.label ||
  state.id
const statusLabel = (state) =>
  state.replay?.status === 'matched'
    ? 'Replay verified'
    : state.replay?.status === 'captured'
      ? 'Captured'
      : 'Needs attention'
const date = (value) =>
  value
    ? new Date(value).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'Not recorded'
const routeLabel = (route) =>
  route?.label || (route ? new URL(route.url).pathname : '')
function activity(message, error = false) {
  $('explore-progress').textContent = message
  $('explore-progress').dataset.status = error ? 'error' : ''
}
function emptyBoard(title, message) {
  $('board').replaceChildren()
  const empty = make($('board'), 'div', undefined, 'empty')
  make(empty, 'span', '◫', 'empty-mark')
  make(empty, 'h2', title)
  make(empty, 'p', message)
}
function renderRoutes() {
  $('routes').replaceChildren()
  $('route-count').textContent = routes().length
  for (const route of routes()) {
    const button = make($('routes'), 'button', undefined, 'route')
    button.type = 'button'
    if (route.id === routeId) button.setAttribute('aria-current', 'page')
    button.title = route.url
    make(button, 'span', undefined, 'route-symbol').innerHTML = icon('page')
    make(button, 'span', routeLabel(route), 'route-name')
    make(
      button,
      'span',
      route.observations.filter((state) => previews(state).length).length,
      'route-count',
    )
    button.addEventListener('click', () => {
      routeId = route.id
      render()
    })
  }
  const hints = library?.sourceRoutes || []
  $('source-routes').hidden = !hints.length
  $('source-list').replaceChildren()
  $('source-summary').textContent = hints.length + ' route patterns'
  for (const hint of hints) {
    const item = make($('source-list'), 'div', undefined, 'source-item')
    make(item, 'strong', hint.template)
    make(
      item,
      'span',
      hint.status === 'resolved'
        ? 'Observed: ' + hint.examples.join(', ')
        : 'No captured example',
    )
  }
}
function renderTabs() {
  $('viewport-tabs').replaceChildren()
  const available = new Map()
  for (const state of captured())
    for (const shot of previews(state))
      available.set(shot.viewport.id, shot.viewport)
  if (available.size && !available.has(viewportId))
    viewportId = available.has('desktop')
      ? 'desktop'
      : available.keys().next().value
  for (const viewport of available.values()) {
    const button = make(
      $('viewport-tabs'),
      'button',
      viewport.label === 'XL desktop' ? 'Wide' : viewport.label,
    )
    button.type = 'button'
    button.setAttribute('aria-pressed', String(viewport.id === viewportId))
    button.addEventListener('click', () => {
      viewportId = viewport.id
      renderBoard()
      renderTabs()
    })
  }
}
function renderBoard() {
  const key = JSON.stringify([routeId, observations(), viewportId, mapMode])
  if (key === boardKey) return
  boardKey = key
  $('board').classList.remove('map-board')
  $('fit-map').hidden = !mapMode
  $('board').replaceChildren()
  $('unavailable').replaceChildren()
  const states = captured(),
    missing = observations().filter((state) => !previews(state).length)
  $('state-count').textContent = states.length
  $('unavailable').hidden = !missing.length
  if (missing.length) {
    make(
      $('unavailable'),
      'h3',
      missing.length +
        ' state' +
        (missing.length === 1 ? '' : 's') +
        ' not captured',
      'unavailable-heading',
    )
    for (const state of missing) {
      const row = make($('unavailable'), 'div', undefined, 'unavailable-item')
      const button = make(row, 'button', stateName(state))
      button.type = 'button'
      button.addEventListener('click', () => openInspector(state.id))
      make(
        row,
        'span',
        state.replay?.reason || 'No browser screenshot is available.',
      )
    }
  }
  if (!states.length) {
    emptyBoard(
      busy ? 'Exploring this page…' : 'No captured states yet',
      activeRoute()?.coverage?.reason ||
        (busy
          ? 'Screens will appear here as captures finish.'
          : 'Explore the app to collect browser observations.'),
    )
    return
  }
  states.forEach((state, index) => {
    const shot = preview(state)
    const button = make($('board'), 'button', undefined, 'state-card')
    button.type = 'button'
    button.setAttribute('aria-label', 'Inspect ' + stateName(state))
    const top = make(button, 'div', undefined, 'card-top'),
      id = make(top, 'span', undefined, 'card-id')
    make(id, 'span', String(index + 1).padStart(2, '0'))
    make(
      id,
      'strong',
      state.intervention?.kind === 'baseline'
        ? 'Original screen'
        : 'Observed variation',
    )
    make(
      top,
      'span',
      statusLabel(state),
      'status ' +
        (state.replay?.status === 'matched'
          ? 'verified'
          : state.replay?.status !== 'captured'
            ? 'warning'
            : ''),
    )
    const frame = make(
      button,
      'div',
      undefined,
      'shot ' + (shot?.viewport.id || ''),
    )
    if (shot) {
      const img = make(frame, 'img')
      img.src = imagePath(state, shot)
      img.alt = stateName(state) + ' at ' + shot.viewport.label
      img.loading = 'lazy'
      img.addEventListener('error', () => {
        frame.replaceChildren()
        make(frame, 'p', 'Screenshot could not be loaded.', 'help')
      })
    } else make(frame, 'p', 'This viewport was not captured.', 'help')
    const bottom = make(button, 'div', undefined, 'card-bottom'),
      text = make(bottom, 'div')
    make(text, 'h3', stateName(state))
    const description = make(
      text,
      'p',
      state.condition || 'Recorded browser observation',
    )
    description.title = state.condition || ''
    make(bottom, 'span', undefined, 'open-arrow').innerHTML = icon('arrow')
    button.addEventListener('click', () => openInspector(state.id))
  })
  if (mapMode) layoutMap(states)
}
function render() {
  renderRoutes()
  renderTabs()
  $('play-exploration').disabled =
    revealSequence(observations()).filter((item) => preview(item)).length < 2
  renderBoard()
  const count = captured().length,
    missing = observations().length - count
  $('route-title').textContent =
    routeLabel(activeRoute()) === '/'
      ? 'Screen overview'
      : routeLabel(activeRoute()) || 'Your screen, in every state.'
  $('route-summary').textContent =
    count +
    ' captured state' +
    (count === 1 ? '' : 's') +
    (missing ? ' · ' + missing + ' not captured' : '') +
    ' · Select a screen to inspect and replay'
  $('total-states').textContent =
    routes().length +
    ' page' +
    (routes().length === 1 ? '' : 's') +
    ' · ' +
    routes().reduce(
      (n, route) =>
        n + route.observations.filter((state) => previews(state).length).length,
      0,
    ) +
    ' captures'
  if (library) {
    const url = new URL(library.target.url)
    $('app-name').textContent = url.hostname
    $('app-origin').textContent = url.host
  }
}
function openInspector(id) {
  stateId = id
  renderInspector()
  if (!$('inspector').open) $('inspector').showModal()
}
function renderInspector() {
  const state = activeState()
  if (!state) return
  const shot = preview(state)
  $('inspect-title').textContent = stateName(state)
  $('inspect-route').textContent = routeLabel(activeRoute())
  $('inspect-condition').textContent =
    state.condition || 'No condition was recorded.'
  $('inspect-image').replaceChildren()
  if (shot) {
    const img = make($('inspect-image'), 'img')
    img.src = imagePath(state, shot)
    img.alt = stateName(state) + ' captured screen'
    img.className = shot.viewport.id
  } else
    make(
      $('inspect-image'),
      'p',
      previews(state).length
        ? 'This viewport was not captured. Choose another viewport in the overview.'
        : 'This state has no captured screenshot.',
      'help',
    )
  const matched = state.replay?.status === 'matched'
  $('inspect-status').className =
    'evidence-status' +
    (matched || state.replay?.status === 'captured' ? '' : ' warning')
  $('inspect-status').textContent = matched
    ? 'Replay verified · visible DOM text matched the capture.'
    : state.replay?.reason ||
      (state.replay?.status === 'captured'
        ? 'Screenshot captured. Replay has not been verified.'
        : 'Replay unavailable.')
  $('inspect-facts').replaceChildren()
  for (const [key, value] of [
    ['Captured', date(state.capturedAt)],
    [
      'Viewport',
      shot
        ? shot.viewport.label +
          ' · ' +
          shot.viewport.width +
          ' × ' +
          shot.viewport.height
        : 'Not captured',
    ],
    ['Intervention', state.intervention?.kind || 'None'],
    [
      'Actions',
      state.actions?.length
        ? state.actions
            .map((action) => action.kind + ': ' + action.selector)
            .join(', ')
        : 'No recorded interaction',
    ],
  ]) {
    const row = make($('inspect-facts'), 'div')
    make(row, 'dt', key)
    make(row, 'dd', value)
  }
  const canReplay =
    !!state.replayRunId &&
    ['captured', 'matched'].includes(state.replay?.status)
  $('replay').disabled = !canReplay || replaying
  $('replay').textContent = replaying
    ? 'Replay in progress…'
    : canReplay
      ? 'Open replay ↗'
      : 'Replay unavailable'
  $('replay-hint').textContent = canReplay
    ? 'Reconstructs this state in a new browser window using its recorded recipe.'
    : 'The saved evidence does not include a supported replay for this state.'
  $('replay-feedback').textContent = ''
  $('evidence-source').textContent = state.evidenceRunId || library.runId
  $('inspect-size').textContent = shot
    ? shot.viewport.width +
      ' × ' +
      shot.viewport.height +
      ' · ' +
      shot.viewport.label +
      ' capture'
    : 'No screenshot'
  const index = observations().findIndex((item) => item.id === stateId)
  $('previous-state').disabled = index <= 0 || replaying
  $('next-state').disabled = index >= observations().length - 1 || replaying
}
function moveState(direction) {
  if (replaying) return
  const index = observations().findIndex((state) => state.id === stateId)
  const next = observations()[index + direction]
  if (next) openInspector(next.id)
}
$('previous-state').addEventListener('click', () => moveState(-1))
$('next-state').addEventListener('click', () => moveState(1))
$('close-inspector').addEventListener('click', () => $('inspector').close())
$('inspector').addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    moveState(event.key === 'ArrowLeft' ? -1 : 1)
  }
})
for (const id of ['inspector', 'advanced-modal'])
  $(id).addEventListener('click', (event) => {
    if (event.target === $(id)) {
      const rect = $(id).getBoundingClientRect()
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        $(id).close()
    }
  })
$('replay').addEventListener('click', async () => {
  const state = activeState()
  if (!state?.replayRunId || replaying) return
  const id = state.id
  replaying = true
  renderInspector()
  $('replay-feedback').textContent =
    'Opening a fresh browser and checking the recorded state…'
  let message,
    error = false
  try {
    const response = await fetch(
      '/api/replay?' +
        new URLSearchParams({ observation: id, run: state.replayRunId }),
      { method: 'POST' },
    )
    message = await response.text()
    error = !response.ok
  } catch {
    message = 'Could not reach the replay service. Try again.'
    error = true
  } finally {
    replaying = false
    if (stateId === id) {
      renderInspector()
      $('replay-feedback').textContent = message
      $('replay-feedback').dataset.status = error ? 'error' : ''
    }
  }
})
$('advanced-toggle').addEventListener('click', () => {
  $('source-folder').value = settings.sourceDirectory
  $('page-limit').value = settings.maxPages
  $('request-matcher').value = settings.requestUrl
  $('retry-selector').value = settings.retrySelector
  $('advanced-modal').showModal()
})
$('settings-form').addEventListener('submit', (event) => {
  if (event.submitter?.value === 'save')
    settings = {
      sourceDirectory: $('source-folder').value.trim(),
      maxPages: $('page-limit').value,
      requestUrl: $('request-matcher').value.trim(),
      retrySelector: $('retry-selector').value.trim(),
    }
})
$('run-history').addEventListener('change', () => {
  selectedRun = $('run-history').value
  lastPayload = ''
  $('inspector').close()
  refresh()
})
async function refresh() {
  if (refreshing) return
  refreshing = true
  try {
    const response = await fetch('/api/progress')
    if (!response.ok) throw new Error('Progress unavailable')
    const progress = await response.json()
    busy = !!progress.active
    renderProgress(progress)
    $('start-explore').disabled = busy
    $('stop-explore').hidden = !busy
    const params = new URLSearchParams()
    if (selectedRun) params.set('run', selectedRun)
    if (targetUrl) params.set('target', targetUrl)
    const result = await fetch('/api/library?' + params)
    if (result.status === 404) {
      library = undefined
      lastPayload = ''
      routeId = undefined
      render()
      $('route-title').textContent = 'Your screen, in every state.'
      $('route-summary').textContent = 'Enter an app URL to start exploring.'
      $('run').textContent = busy ? 'Exploring' : 'Ready to explore'
      $('run').dataset.status = ''
      activity(busy ? 'Discovering pages and capturing browser evidence…' : '')
      return
    }
    if (!result.ok) throw new Error('Evidence unavailable')
    const payload = await result.text()
    if (payload !== lastPayload) {
      const previousUrl = activeRoute()?.url
      library = JSON.parse(payload)
      lastPayload = payload
      routeId =
        routes().find((route) => route.url === previousUrl)?.id ||
        routes()[0]?.id
      if (!targetUrl) {
        targetUrl = library.target.url
        if (!$('explore-url').value) $('explore-url').value = targetUrl
      }
      const history = $('run-history')
      history.replaceChildren()
      make(history, 'option', 'Latest observations').value = ''
      for (const run of library.history || []) {
        const option = make(
          history,
          'option',
          date(run.startedAt) + ' · ' + run.kind,
        )
        option.value = run.runId
      }
      history.value = selectedRun
      render()
    }
    $('run').textContent = busy ? 'Exploring' : 'Local workspace'
    $('run').dataset.status = ''
    const p = library.progress
    activity(
      busy
        ? 'Exploring · ' +
            p.captured +
            ' of ' +
            p.discovered +
            ' pages captured'
        : library.error ||
            (library.status === 'stopped'
              ? 'Exploration stopped. Completed evidence is preserved.'
              : '') ||
            library.notes?.join(' ') ||
            (p.attention
              ? p.attention +
                ' page' +
                (p.attention === 1 ? '' : 's') +
                ' need attention'
              : library.status === 'running'
                ? 'Exploration was interrupted. Completed captures are preserved.'
                : ''),
    )
  } catch {
    $('run').textContent = 'Connection lost'
    $('run').dataset.status = 'error'
    activity(
      'Unable to refresh. Check that the local dashboard is running.',
      true,
    )
  } finally {
    refreshing = false
  }
}
$('explore-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  if (busy) return
  const input = $('explore-url').value.trim()
  let parsed
  try {
    parsed = new URL(input)
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password
    )
      throw new Error()
  } catch {
    activity('Enter an HTTP or HTTPS app URL without credentials.', true)
    return
  }
  $('start-explore').disabled = true
  activity('Starting exploration…')
  try {
    const body = { targetUrl: parsed.href }
    if (settings.sourceDirectory)
      body.sourceDirectory = settings.sourceDirectory
    if (settings.maxPages) body.maxPages = Number(settings.maxPages)
    if (settings.requestUrl) body.requestUrl = settings.requestUrl
    if (settings.retrySelector) body.retrySelector = settings.retrySelector
    const response = await fetch('/api/explore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(await response.text())
    targetUrl = parsed.href
    selectedRun = ''
    lastPayload = ''
    $('inspector').close()
    await refresh()
  } catch (error) {
    activity(error.message || 'Could not start exploration.', true)
    $('start-explore').disabled = false
  }
})
$('stop-explore').addEventListener('click', async () => {
  $('stop-explore').disabled = true
  try {
    const response = await fetch('/api/explore/stop', { method: 'POST' })
    activity(await response.text(), !response.ok)
  } catch {
    activity('Could not stop exploration. Try again.', true)
  } finally {
    $('stop-explore').disabled = false
  }
})

function layoutMap(states) {
  const board = $('board'),
    cards = [...board.children]
  const stage = document.createElement('div')
  stage.className = 'map-stage'
  board.classList.add('map-board')
  const surface = document.createElement('div')
  surface.className = 'map-surface'
  surface.append(stage)
  board.replaceChildren(surface)
  const positions = new Map()
  const base = states.find((state) => state.id === 'baseline')
  const variations = states.filter(
    (state) => state.id !== 'baseline' && state.id !== 'recovered',
  )
  const recovery = states.find((state) => state.id === 'recovered')
  const rows = Math.max(variations.length, 1),
    height = rows * 264 - 24
  states.forEach((state, index) => {
    const pos =
      state === base
        ? [16, Math.max(0, (height - 240) / 2)]
        : state === recovery
          ? [
              800,
              Math.max(
                0,
                variations.findIndex((item) => item.id === 'failed'),
              ) * 264,
            ]
          : [408, Math.max(0, variations.indexOf(state)) * 264]
    positions.set(state.id, pos)
    cards[index].style.left = pos[0] + 'px'
    cards[index].style.top = pos[1] + 'px'
    stage.append(cards[index])
  })
  const width = recovery ? 1128 : variations.length ? 736 : 344
  stage.style.width = width + 'px'
  stage.style.height = height + 'px'
  const ns = 'http://www.w3.org/2000/svg',
    svg = document.createElementNS(ns, 'svg')
  svg.classList.add('map-edges')
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  function edge(from, to, label) {
    const a = positions.get(from.id),
      b = positions.get(to.id)
    if (!a || !b) return
    const x1 = a[0] + 312,
      y1 = a[1] + 120,
      x2 = b[0],
      y2 = b[1] + 120,
      mid = (x1 + x2) / 2
    const path = document.createElementNS(ns, 'path')
    path.setAttribute(
      'd',
      'M ' +
        x1 +
        ' ' +
        y1 +
        ' C ' +
        mid +
        ' ' +
        y1 +
        ' ' +
        mid +
        ' ' +
        y2 +
        ' ' +
        x2 +
        ' ' +
        y2,
    )
    svg.append(path)
    const text = document.createElementNS(ns, 'text')
    text.setAttribute('x', String(mid))
    text.setAttribute('y', String(y2 - 10))
    text.setAttribute('text-anchor', 'middle')
    text.textContent = label
    svg.append(text)
  }
  for (const state of variations)
    if (base && state.evidenceRunId === base.evidenceRunId && state.replayRunId)
      edge(
        base,
        state,
        { loading: 'Delay', empty: 'Empty', failed: 'Fail' }[state.id] ||
          'Vary',
      )
  const failed = states.find((state) => state.id === 'failed')
  if (
    recovery &&
    failed &&
    recovery.evidenceRunId === failed.evidenceRunId &&
    recovery.actions?.some((action) => action.kind === 'click')
  )
    edge(failed, recovery, 'Retry')
  stage.prepend(svg)
  board.dataset.mapWidth = width
  board.dataset.mapHeight = height
  fitMap()
}
function fitMap() {
  const board = $('board'),
    stage = board.querySelector('.map-stage')
  if (!stage) return
  const availableHeight = Math.max(
    320,
    innerHeight - board.getBoundingClientRect().top - 48,
  )
  const scale = Math.min(
    1,
    Math.max(
      0.5,
      Math.min(
        (board.clientWidth - 24) / Number(board.dataset.mapWidth),
        availableHeight / Number(board.dataset.mapHeight),
      ),
    ),
  )
  stage.style.transform = 'scale(' + scale + ')'
  stage.parentElement.style.width =
    Number(board.dataset.mapWidth) * scale + 'px'
  stage.parentElement.style.height =
    Number(board.dataset.mapHeight) * scale + 'px'
  board.scrollTop = 0
  board.scrollLeft = 0
  board.style.setProperty(
    '--map-height',
    Math.ceil(Number(board.dataset.mapHeight) * scale + 32) + 'px',
  )
}
$('map-view').addEventListener('click', () => {
  mapMode = true
  $('map-view').setAttribute('aria-pressed', 'true')
  $('grid-view').setAttribute('aria-pressed', 'false')
  renderBoard()
})
$('grid-view').addEventListener('click', () => {
  mapMode = false
  $('map-view').setAttribute('aria-pressed', 'false')
  $('grid-view').setAttribute('aria-pressed', 'true')
  renderBoard()
})
$('focus-map').addEventListener('click', () => {
  const focused = document.body.classList.toggle('map-focus')
  $('focus-map').setAttribute('aria-pressed', String(focused))
  $('focus-map').setAttribute(
    'aria-label',
    focused ? 'Exit focused map' : 'Focus map',
  )
  fitMap()
})
$('fit-map').addEventListener('click', fitMap)
window.addEventListener('resize', fitMap)
function renderProgress(progress) {
  $('progress-panel').hidden = !progress.active
  if (!progress.active) {
    progressStarted = undefined
    return
  }
  progressStarted =
    progress.startedAt || progressStarted || new Date().toISOString()
  const phase = progress.activity?.phase || 'discovering',
    names = {
      discovering: 'Discovering pages',
      capturing: 'Capturing screens',
      experiments: 'Exploring screen states',
    }
  $('progress-title').textContent = names[phase] || 'Exploring'
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(progressStarted)) / 1000),
  )
  $('progress-elapsed').textContent =
    Math.floor(seconds / 60) +
    'm ' +
    String(seconds % 60).padStart(2, '0') +
    's'
  $('progress-detail').textContent =
    [progress.activity?.route, progress.activity?.detail]
      .filter(Boolean)
      .join(' · ') || 'Opening the app'
  $('progress-count').textContent =
    (progress.captured || 0) +
    ' / ' +
    (progress.discovered || 0) +
    ' pages captured'
  const ratio =
    phase === 'experiments'
      ? (progress.activity?.completedSteps || 0) /
        Math.max(1, progress.activity?.totalSteps || 1)
      : (progress.captured || 0) / Math.max(1, progress.discovered || 1)
  $('progress-fill').style.width = Math.max(3, Math.min(100, ratio * 100)) + '%'
  $('progress-fill').classList.toggle('indeterminate', phase === 'discovering')
  document
    .querySelectorAll('.progress-steps li')
    .forEach((li) => li.classList.toggle('active', li.dataset.phase === phase))
}
$('workspace-toggle').addEventListener('click', async () => {
  $('workspace-list').replaceChildren()
  make($('workspace-list'), 'p', 'Loading workspaces…', 'help')
  $('workspaces-modal').showModal()
  try {
    const response = await fetch('/api/workspaces')
    if (!response.ok) throw new Error()
    const workspaces = await response.json()
    $('workspace-list').replaceChildren()
    if (!workspaces.length)
      make(
        $('workspace-list'),
        'p',
        'No recorded workspaces yet. Explore an app to create one.',
        'help',
      )
    for (const workspace of workspaces) {
      const button = make(
        $('workspace-list'),
        'button',
        undefined,
        'workspace-option',
      )
      const title = make(button, 'strong', new URL(workspace.origin).host)
      make(
        button,
        'span',
        workspace.runs + ' runs · ' + date(workspace.lastCaptured),
      )
      if (library?.target.origin === workspace.origin) {
        title.textContent += ' · Current'
        button.setAttribute('aria-current', 'true')
      }
      button.addEventListener('click', () => {
        targetUrl = workspace.target
        $('explore-url').value = targetUrl
        selectedRun = ''
        lastPayload = ''
        boardKey = ''
        routeId = undefined
        $('workspaces-modal').close()
        refresh()
      })
    }
  } catch {
    $('workspace-list').replaceChildren()
    make(
      $('workspace-list'),
      'p',
      'Could not load workspaces. Close this dialog and try again.',
      'help',
    )
  }
})
$('close-workspaces').addEventListener('click', () =>
  $('workspaces-modal').close(),
)

let serverVersion
setInterval(async () => {
  try {
    const response = await fetch('/api/version')
    if (!response.ok) return
    const value = await response.json()
    if (value.dev && serverVersion && value.version !== serverVersion)
      location.reload()
    serverVersion = value.version
  } catch {
    /* The development server may be rebuilding. */
  }
}, 1500)
refresh()
setInterval(() => {
  if (
    !$('inspector').open &&
    !$('advanced-modal').open &&
    !$('workspaces-modal').open &&
    !$('reveal-dialog').open
  )
    refresh()
}, 2000)
`
