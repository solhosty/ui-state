import { test } from 'node:test'
import assert from 'node:assert/strict'
import { candidateUrl, resolveTemplate, routePattern } from './discovery.js'

test('keeps same-origin pages and query routes but excludes external and destructive links', () => {
  const base = 'https://example.test/'
  assert.equal(candidateUrl('/items?page=2', base), base + 'items?page=2')
  assert.equal(candidateUrl('https://other.test/page', base), undefined)
  assert.equal(candidateUrl('/logout', base), undefined)
  assert.equal(candidateUrl('/image.png', base), undefined)
  assert.equal(candidateUrl('/#/settings', base), base + '#/settings')
})
test('resolves parameters from matching observed paths without guessing unrelated IDs', () => {
  assert.equal(resolveTemplate('/projects/:id/settings', 'https://example.test/projects/123'), '/projects/123/settings')
  assert.equal(resolveTemplate('/projects/[id]/settings', 'https://example.test/users/123'), undefined)
  assert.equal(resolveTemplate('/teams/:team/projects/:id', 'https://example.test/teams/acme'), undefined)
  assert.equal(resolveTemplate('/files/[...path]', 'https://example.test/files/a'), undefined)
})
test('matches common dynamic template syntaxes', () => {
  for (const template of ['/projects/:id/settings','/projects/[id]/settings','/projects/$id/settings']) {
    assert.ok(routePattern(template).test('/projects/123/settings'))
    assert.ok(!routePattern(template).test('/projects/123/other'))
  }
})
