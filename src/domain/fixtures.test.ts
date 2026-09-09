import assert from 'node:assert/strict'
import test from 'node:test'
import { emptyFirstCollection } from './fixtures.js'

test('empties the first collection without changing its surrounding response shape', () => {
  const result = emptyFirstCollection(Buffer.from('{"meta":{"page":1},"items":[{"id":"one"}]}'))
  assert.deepEqual(JSON.parse(result?.toString('utf8') ?? ''), { meta: { page: 1 }, items: [] })
})

test('does not invent an empty-state fixture when a response has no collection', () => {
  assert.equal(emptyFirstCollection(Buffer.from('{"status":"ok"}')), undefined)
})
