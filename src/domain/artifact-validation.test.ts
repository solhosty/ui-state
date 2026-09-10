import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import {
  fixtureHashMatches,
  validateRunArtifact,
} from './artifact-validation.js'
import type { RunArtifact } from './contracts.js'

const run: RunArtifact = {
  schemaVersion: 5,
  runId: 'run_test',
  target: { url: 'http://localhost:3000', origin: 'http://localhost:3000' },
  request: {
    method: 'GET',
    url: 'http://localhost:3000/api/items',
    match: { method: 'GET', urlIncludes: '/api/items' },
    fixturePath: 'fixtures/response.json',
    fixtureSha256: 'a'.repeat(64),
  },
  startedAt: '2026-01-01T00:00:00.000Z',
  completedAt: '2026-01-01T00:00:01.000Z',
  observations: [
    {
      id: 'baseline',
      label: 'Baseline',
      condition: 'captured',
      capturedAt: '2026-01-01T00:00:00.000Z',
      intervention: { kind: 'baseline' },
      actions: [],
      replay: { status: 'captured', attempts: 1 },
      previews: [
        {
          viewport: { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
          screenshot: 'screenshots/baseline-mobile.png',
          visibleText: 'Ready',
          domHash: 'a'.repeat(64),
        },
        {
          viewport: { id: 'tablet', label: 'Tablet', width: 820, height: 1180 },
          screenshot: 'screenshots/baseline-tablet.png',
          visibleText: 'Ready',
          domHash: 'a'.repeat(64),
        },
        {
          viewport: {
            id: 'desktop',
            label: 'Desktop',
            width: 1440,
            height: 960,
          },
          screenshot: 'screenshots/baseline-desktop.png',
          visibleText: 'Ready',
          domHash: 'a'.repeat(64),
        },
        {
          viewport: {
            id: 'xl-desktop',
            label: 'XL desktop',
            width: 1920,
            height: 1080,
          },
          screenshot: 'screenshots/baseline-xl.png',
          visibleText: 'Ready',
          domHash: 'a'.repeat(64),
        },
      ],
    },
  ],
  authentication: { mode: 'none' },
  routes: [
    {
      id: 'root',
      label: '/',
      url: 'http://localhost:3000',
      source: 'start',
      coverage: { status: 'captured' },
      observations: [],
    },
  ],
  limits: {
    responseInterception: 'explicit-read-only-get',
    outgoingWrites: 'blocked',
    serviceWorkers: 'unsupported',
    realtime: 'unsupported',
  },
}

test('accepts a bounded GET-only artifact', () =>
  assert.doesNotThrow(() =>
    validateRunArtifact({
      ...run,
      routes: [{ ...run.routes[0]!, observations: run.observations }],
    }),
  ))
test('rejects a fixture path outside the run fixture directory', () =>
  assert.throws(() =>
    validateRunArtifact({
      ...run,
      request: { ...run.request, fixturePath: '../response.json' },
    }),
  ))
test('rejects a non-HTTP recorded request URL', () =>
  assert.throws(() =>
    validateRunArtifact({
      ...run,
      request: { ...run.request, url: 'file:///tmp/response.json' },
    }),
  ))
test('rejects a malformed fixture hash', () =>
  assert.throws(() =>
    validateRunArtifact({
      ...run,
      request: { ...run.request, fixtureSha256: 'bad' },
    }),
  ))
test('rejects an authenticated run without a local session-state reference', () =>
  assert.throws(() =>
    validateRunArtifact({
      ...run,
      authentication: { mode: 'playwright-storage-state' },
    }),
  ))
test('rejects an action without a bounded selector', () => {
  const [baseline] = run.observations
  assert.ok(baseline)
  assert.throws(() =>
    validateRunArtifact({
      ...run,
      observations: [
        { ...baseline, actions: [{ kind: 'click', selector: ' ' }] },
      ],
    }),
  )
})
test('checks fixture bytes against their recorded hash', () => {
  const body = Buffer.from('{"items":[]}')
  const hash = createHash('sha256').update(body).digest('hex')
  assert.equal(fixtureHashMatches(hash, body), true)
  assert.equal(fixtureHashMatches(hash, Buffer.from('{"items":[1]}')), false)
})
