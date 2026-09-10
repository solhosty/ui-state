import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

for (const args of [['--port', '4190'], ['--port=4176'], ['--port', '4174']]) {
  test(`dashboard rejects port override ${args.join(' ')}`, () => {
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL('./cli.js', import.meta.url)),
        'dashboard',
        ...args,
      ],
      { encoding: 'utf8' },
    )
    assert.equal(result.status, 1)
    assert.match(result.stderr, /always uses http:\/\/localhost:4174/)
  })
}
