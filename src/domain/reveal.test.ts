import { test } from 'node:test'
import assert from 'node:assert/strict'
import { revealSequence } from './reveal.js'
import type { LibraryObservation } from './library.js'
const observation = (id: string, run = 'run_a', click = false) =>
  ({
    id,
    screenshot: 'shot.png',
    evidenceRunId: run,
    actions: click ? [{ kind: 'click', selector: 'button' }] : [],
  }) as LibraryObservation

test('reveal orders real observations and requires a recorded recovery edge', () => {
  const states = [
    observation('recovered', 'run_a', true),
    observation('failed'),
    observation('baseline'),
    observation('empty'),
  ]
  assert.deepEqual(
    revealSequence(states).map((item) => item.id),
    ['baseline', 'empty', 'failed', 'recovered'],
  )
  assert.deepEqual(
    revealSequence([
      observation('baseline'),
      observation('recovered', 'run_a', true),
    ]).map((item) => item.id),
    ['baseline'],
  )
})
test('reveal excludes mixed runs, missing screenshots, and unrecorded retry', () => {
  assert.deepEqual(
    revealSequence([
      observation('baseline'),
      observation('loading', 'run_b'),
      observation('failed'),
      observation('recovered'),
    ]).map((item) => item.id),
    ['baseline', 'failed'],
  )
  assert.deepEqual(revealSequence([observation('failed')]), [])
})
