import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { discoverSourceRoutes } from './source-routes.js'

test('discovers filesystem and literal routes without traversing dependencies or symlinks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'source-routes-'))
  try {
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ dependencies: { next: '*' } }),
    )
    await mkdir(join(root, 'app/projects/[id]/settings'), { recursive: true })
    await writeFile(
      join(root, 'app/projects/[id]/settings/page.tsx'),
      'export default function Page() {}',
    )
    await writeFile(
      join(root, 'router.tsx'),
      '<Route path="/login"/><Route path="/teams/:id"/>',
    )
    await mkdir(join(root, 'node_modules'))
    await writeFile(
      join(root, 'node_modules/routes.ts'),
      'const path = "/ignored"',
    )
    const result = await discoverSourceRoutes(root)
    assert.deepEqual(result.routes.map((r) => r.template).sort(), [
      '/login',
      '/projects/[id]/settings',
      '/teams/:id',
    ])
    assert.ok(result.routes.every((r) => r.status === 'unresolved'))
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('does not assume React component folders define routes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'source-routes-react-'))
  try {
    await mkdir(join(root, 'src/pages/Homepage'), { recursive: true })
    await writeFile(
      join(root, 'src/pages/Homepage/index.tsx'),
      'export default function Home() {}',
    )
    assert.equal((await discoverSourceRoutes(root)).routes.length, 0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
