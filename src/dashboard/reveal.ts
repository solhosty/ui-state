import { revealSequence } from '../domain/reveal.js'

export const revealScript =
  `const revealSequence = ${revealSequence.toString()};\n` +
  String.raw`
let revealFrames = [],
  revealTimers = [],
  revealSelected,
  revealPhase = 'intro',
  revealBusy = false,
  revealSession = 0
const stopRevealTimers = () => {
  revealTimers.forEach(clearTimeout)
  revealTimers = []
}
const later = (callback, delay) => {
  revealTimers.push(setTimeout(callback, delay))
}
function setRevealCaption(kicker, title, detail) {
  $('reveal-kicker').textContent = kicker
  $('reveal-headline').textContent = title
  $('reveal-description').textContent = detail
}
function openReveal() {
  stopRevealTimers()
  revealSession++
  revealPhase = 'intro'
  revealSelected = undefined
  revealFrames = revealSequence(observations()).filter((item) => preview(item))
  if (revealFrames.length < 2) return
  $('reveal-scene').replaceChildren()
  $('reveal-dialog').className = 'reveal-dialog intro'
  $('reveal-source').textContent =
    new URL(activeRoute().url).host + routeLabel(activeRoute())
  $('reveal-recorded').textContent =
    'Recorded exploration · ' +
    date(revealFrames[0].capturedAt) +
    ' · ' +
    revealFrames.length +
    ' states'
  $('reveal-action').hidden = false
  $('reveal-action').disabled = false
  $('reveal-action').textContent = 'Reveal states'
  $('reveal-live').hidden = true
  $('reveal-inspect').hidden = true
  $('reveal-again').hidden = true
  $('reveal-feedback').textContent = ''
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 1000 650')
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.classList.add('reveal-edges')
  $('reveal-scene').append(svg)
  const positions = {
    baseline: [35, 225, 280, 205],
    loading: [405, 10, 255, 185],
    empty: [405, 235, 255, 185],
    failed: [405, 460, 255, 185],
    recovered: [730, 460, 255, 185],
  }
  const paths = {
    loading: 'M315 327 C360 327 355 102 405 102',
    empty: 'M315 327 H405',
    failed: 'M315 327 C360 327 355 552 405 552',
    recovered: 'M660 552 H730',
  }
  const labels = {
    baseline: 'Original screen',
    loading: 'Response delayed',
    empty: 'Collection emptied',
    failed: 'Request returns 500',
    recovered: 'Retry restores response',
  }
  for (const [index, item] of revealFrames.entries()) {
    const card = make(
      $('reveal-scene'),
      'button',
      undefined,
      'reveal-card ' + item.id,
    )
    card.type = 'button'
    card.dataset.state = item.id
    card.setAttribute('aria-label', 'Focus ' + stateName(item))
    card.disabled = index > 0
    card.setAttribute('aria-hidden', String(index > 0))
    const pos = positions[item.id]
    card.style.setProperty('--x', pos[0] / 10 + '%')
    card.style.setProperty('--y', pos[1] / 6.5 + '%')
    card.style.setProperty('--w', pos[2] / 10 + '%')
    card.style.setProperty('--h', pos[3] / 6.5 + '%')
    const chrome = make(card, 'div', undefined, 'reveal-card-top')
    make(chrome, 'span', labels[item.id])
    make(chrome, 'span', String(index + 1).padStart(2, '0'), 'reveal-number')
    const shot = preview(item),
      frame = make(card, 'div', undefined, 'reveal-shot'),
      img = make(frame, 'img')
    img.src = imagePath(item, shot)
    img.alt = stateName(item) + ' — actual browser capture'
    const bottom = make(card, 'div', undefined, 'reveal-card-bottom')
    make(bottom, 'strong', stateName(item))
    make(
      bottom,
      'span',
      item.replay.status === 'matched' ? 'Replay verified' : 'Captured',
    )
    card.addEventListener('click', () => {
      if (revealPhase === 'intro') startReveal()
      else focusReveal(item.id)
    })
    if (paths[item.id]) {
      const path = document.createElementNS(svg.namespaceURI, 'path')
      path.setAttribute('d', paths[item.id])
      path.setAttribute('pathLength', '1')
      path.dataset.state = item.id
      svg.append(path)
    }
  }
  setRevealCaption(
    'ONE SCREEN',
    'What happens when the response changes?',
    'Start with the screen your users normally see.',
  )
  $('reveal-dialog').showModal()
  $('reveal-action').focus({ preventScroll: true })
}
function startReveal() {
  if (revealPhase !== 'intro') return
  revealPhase = 'playing'
  $('reveal-dialog').classList.remove('intro')
  $('reveal-action').hidden = true
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const stories = {
    loading: [
      '01 · DELAY',
      'Make it wait.',
      'The loading screen, captured while the response is delayed.',
    ],
    empty: [
      '02 · EMPTY',
      'Take the content away.',
      'The same screen with an empty collection.',
    ],
    failed: [
      '03 · FAILURE',
      'Now let the request fail.',
      'A real browser observation under an injected HTTP 500.',
    ],
    recovered: [
      '04 · RECOVERY',
      'Follow the retry back.',
      'A recorded click restores the captured response.',
    ],
  }
  let delay = reduced ? 0 : 750
  for (const item of revealFrames.slice(1)) {
    later(() => {
      const card = $('reveal-scene').querySelector(
        '[data-state="' + item.id + '"].reveal-card',
      )
      card.classList.add('visible')
      card.disabled = false
      card.removeAttribute('aria-hidden')
      $('reveal-scene')
        .querySelector('path[data-state="' + item.id + '"]')
        .classList.add('visible')
      setRevealCaption(...stories[item.id])
    }, delay)
    delay += reduced ? 0 : 1100
  }
  later(
    () => {
      revealPhase = 'map'
      $('reveal-again').hidden = false
      setRevealCaption(
        'ONE SCREEN · ' + revealFrames.length + ' OBSERVATIONS',
        'Now step into a state.',
        'Select a screen. Open its recorded recipe in a real browser.',
      )
    },
    delay + (reduced ? 0 : 500),
  )
}
function focusReveal(id) {
  stopRevealTimers()
  revealSelected = revealFrames.find((item) => item.id === id)
  if (!revealSelected) return
  revealPhase = 'focus'
  $('reveal-dialog').classList.add('state-focused')
  document.querySelectorAll('.reveal-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.state === id)
    card.classList.add('visible')
    card.disabled = card.dataset.state !== id
    card.setAttribute('aria-hidden', String(card.dataset.state !== id))
  })
  document
    .querySelectorAll('.reveal-edges path')
    .forEach((path) => path.classList.add('visible'))
  $('reveal-live').hidden = false
  $('reveal-live').disabled =
    revealBusy ||
    !revealSelected.replayRunId ||
    !['matched', 'captured'].includes(revealSelected.replay.status)
  $('reveal-live').textContent = revealBusy
    ? 'Opening browser…'
    : 'Open this state ↗'
  $('reveal-inspect').hidden = false
  $('reveal-again').hidden = false
  $('reveal-action').hidden = false
  $('reveal-action').textContent = 'Back to map'
  const titles = {
    baseline: 'The original screen.',
    loading: 'While the user waits.',
    empty: 'When there is nothing to show.',
    failed: 'When the request fails.',
    recovered: 'Back from a failed request.',
  }
  setRevealCaption('OBSERVED STATE', titles[id], revealSelected.condition)
}
function returnRevealMap() {
  revealPhase = 'map'
  $('reveal-dialog').classList.remove('state-focused')
  document.querySelectorAll('.reveal-card').forEach((card) => {
    card.disabled = false
    card.removeAttribute('aria-hidden')
  })
  $('reveal-action').hidden = true
  $('reveal-live').hidden = true
  $('reveal-inspect').hidden = true
  $('reveal-feedback').textContent = ''
  setRevealCaption(
    'EXPLORE THE OBSERVATIONS',
    'One screen. Different conditions.',
    'Select another state or replay the reveal.',
  )
}
$('play-exploration').addEventListener('click', openReveal)
$('reveal-action').addEventListener('click', () => {
  if (revealPhase === 'intro') startReveal()
  else returnRevealMap()
})
$('reveal-again').addEventListener('click', () => {
  if (revealBusy) return
  $('reveal-dialog').close()
  openReveal()
})
$('reveal-close').addEventListener('click', () => $('reveal-dialog').close())
$('reveal-dialog').addEventListener('close', stopRevealTimers)
$('reveal-dialog').addEventListener('keydown', (event) => {
  if (event.code === 'Space' && event.target === $('reveal-dialog')) {
    event.preventDefault()
    if (revealPhase === 'intro') startReveal()
  }
})
$('reveal-inspect').addEventListener('click', () => {
  if (!revealSelected) return
  const id = revealSelected.id
  $('reveal-dialog').close()
  openInspector(id)
})
$('reveal-live').addEventListener('click', async () => {
  if (revealBusy || !revealSelected?.replayRunId) return
  const selected = revealSelected
  const session = revealSession
  for (const id of ['reveal-action', 'reveal-again', 'reveal-inspect'])
    $(id).disabled = true
  revealBusy = true
  $('reveal-live').disabled = true
  $('reveal-live').textContent = 'Opening browser…'
  $('reveal-feedback').textContent =
    'Reconstructing the recorded state in a fresh browser.'
  try {
    const response = await fetch(
      '/api/replay?' +
        new URLSearchParams({
          run: selected.replayRunId,
          observation: selected.id,
        }),
      { method: 'POST' },
    )
    const message = await response.text()
    if (session !== revealSession) return
    $('reveal-feedback').textContent = message
    $('reveal-feedback').dataset.status = response.ok ? 'success' : 'error'
  } catch {
    if (session !== revealSession) return
    $('reveal-feedback').textContent =
      'Could not reach the replay service. Try again.'
    $('reveal-feedback').dataset.status = 'error'
  } finally {
    revealBusy = false
    for (const id of ['reveal-action', 'reveal-again', 'reveal-inspect'])
      $(id).disabled = false
    $('reveal-live').disabled =
      !revealSelected?.replayRunId ||
      !['matched', 'captured'].includes(revealSelected?.replay.status)
    $('reveal-live').textContent = 'Open this state ↗'
  }
})
`
