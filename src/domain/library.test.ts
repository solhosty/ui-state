import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLibrary, type SavedRun } from './library.js'
const run = (id: string, date: string, schemaVersion: number, states: string[], target = 'http://localhost:3000') => ({
  runId: id, startedAt: date, schemaVersion, target: { url: target, origin: target },
  routes: [{ id: 'root', url: target + '/', label: '/', source: 'start', coverage: { status: 'captured' }, observations: states.map(id => ({ id, label: id, replay: { status: 'captured' } })) }], observations: states.map(id => ({id})),
}) as unknown as SavedRun

test('a newer page-only run preserves all previous controlled states and provenance', () => {
  const library = buildLibrary([run('states','2026-09-09',5,['baseline','loading','empty','failed','recovered']), run('pages','2026-09-10',6,['baseline'])])!
  assert.equal(library.routes[0]!.observations.length,5)
  assert.ok(library.routes[0]!.observations.every(s => s.evidenceRunId === 'states' && s.replayRunId === 'states'))
  assert.equal(library.history.length,2)
})
test('history selection is exact and origins never mix', () => {
  const states = run('states','2026-09-09',5,['baseline','loading'])
  const pages = run('pages','2026-09-10',6,['baseline'])
  assert.equal(buildLibrary([states,pages], 'pages')!.observations.length,1)
  assert.equal(buildLibrary([states,run('other','2026-09-11',6,['baseline'],'https://other.test')])!.observations.length,1)
  assert.equal(buildLibrary([states], 'missing'),undefined)
})
