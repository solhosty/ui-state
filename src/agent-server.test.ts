import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  mkdtemp,
  readFile,
  rm,
  readdir,
  symlink,
  unlink,
} from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { createAgentServer } from './agent-server.js'

const fixturePage = `<!doctype html><title>Agent tool fixture</title><main><h1>Projects</h1><section id="content">Loading projects…</section></main><script>
async function load(){const node=document.querySelector('#content');node.textContent='Loading projects…';try{const response=await fetch('/api/projects');if(!response.ok)throw Error();const data=await response.json();node.textContent=data.projects.length?data.projects.map(p=>p.name).join(', '):'No projects yet';}catch{node.innerHTML='Could not load projects. <button onclick="load()">Try again</button>';}}load();</script>`

test(
  'agent can capture, inspect images, replay, then recapture changed UI through MCP',
  { timeout: 180_000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), 'screen-agent-'))
    let title = 'Projects'
    const target = createServer((request, response) => {
      response.setHeader(
        'Content-Type',
        request.url === '/api/projects' ? 'application/json' : 'text/html',
      )
      response.end(
        request.url === '/api/projects'
          ? JSON.stringify({ projects: [{ name: 'Alpha' }, { name: 'Beta' }] })
          : fixturePage.replace('<h1>Projects</h1>', `<h1>${title}</h1>`),
      )
    })
    const server = createAgentServer(root)
    const client = new Client({ name: 'agent-contract-test', version: '1.0' })
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair()
    try {
      await new Promise<void>((resolve) =>
        target.listen(0, '127.0.0.1', resolve),
      )
      const address = target.address()
      if (!address || typeof address === 'string')
        throw Error('Missing target port')
      await server.connect(serverTransport)
      await client.connect(clientTransport)
      assert.deepEqual(
        (await client.listTools()).tools.map((tool) => tool.name).sort(),
        ['explore_states', 'inspect_states', 'list_runs', 'replay_state'],
      )
      const result = await client.callTool(
        {
          name: 'explore_states',
          arguments: {
            targetUrl: `http://127.0.0.1:${address.port}`,
            requestUrlIncludes: '/api/projects',
          },
        },
        undefined,
        { timeout: 150_000 },
      )
      assert.equal(
        result.isError,
        undefined,
        JSON.stringify(result).slice(0, 500),
      )
      const content = result.content as Array<{
        type: string
        text?: string
        data?: string
      }>
      assert.equal(content[0]?.type, 'image')
      assert.equal(
        Buffer.from(content[0]!.data!, 'base64').subarray(1, 4).toString(),
        'PNG',
      )
      const evidence = JSON.parse(content[1]!.text!)
      assert.equal(evidence.states.length, 5)
      assert.ok(
        evidence.states.every(
          (state: { replay: { status: string } }) =>
            state.replay.status === 'matched',
        ),
      )
      assert.equal(
        evidence.states.find(
          (state: { id: string }) => state.id === 'recovered',
        ).actions[0].kind,
        'click',
      )
      assert.deepEqual((await readdir(evidence.evidenceDirectory)).sort(), [
        'README.md',
        'baseline.png',
        'empty.png',
        'evidence.json',
        'failed.png',
        'loading.png',
        'overview.png',
        'recovered.png',
      ])
      assert.equal('authentication' in evidence, false)
      assert.equal('request' in evidence, false)
      const detail = await client.callTool({
        name: 'inspect_states',
        arguments: {
          runId: evidence.sourceRun,
          state: 'failed',
          viewport: 'mobile',
        },
      })
      assert.equal(detail.isError, undefined)
      const replay = await client.callTool({
        name: 'replay_state',
        arguments: { runId: evidence.sourceRun, state: 'recovered' },
      })
      assert.equal(replay.isError, undefined)
      assert.equal(
        JSON.parse((replay.content as { text: string }[])[1]!.text).verification
          .status,
        'matched',
      )
      // A source change must appear in fresh evidence rather than silently reusing the old capture.
      title = 'Team projects'
      const changed = await client.callTool(
        {
          name: 'explore_states',
          arguments: {
            targetUrl: `http://127.0.0.1:${address.port}`,
            requestUrlIncludes: '/api/projects',
          },
        },
        undefined,
        { timeout: 150_000 },
      )
      assert.equal(changed.isError, undefined)
      const fresh = JSON.parse((changed.content as { text: string }[])[1]!.text)
      assert.notEqual(fresh.sourceRun, evidence.sourceRun)
      assert.ok(fresh.states[0].visibleText.includes('Team projects'))
      assert.ok(!evidence.states[0].visibleText.includes('Team projects'))
      // The compositor must not follow a screenshot symlink outside its original run.
      const runDirectory = join(root, 'runs', evidence.sourceRun)
      const raw = JSON.parse(
        await readFile(join(runDirectory, 'run.json'), 'utf8'),
      )
      const path = join(
        runDirectory,
        raw.observations[0].previews.find(
          (p: { viewport: { id: string } }) => p.viewport.id === 'desktop',
        ).screenshot,
      )
      await unlink(path)
      await symlink(join(evidence.evidenceDirectory, 'baseline.png'), path)
      const escaped = await client.callTool({
        name: 'inspect_states',
        arguments: { runId: evidence.sourceRun },
      })
      assert.equal(escaped.isError, true)
    } finally {
      await client.close()
      await server.close()
      await new Promise<void>((resolve) => target.close(() => resolve()))
      await rm(root, { recursive: true, force: true })
    }
  },
)

test('stdio CLI initializes and lists tools without extra stdout or a dashboard server', async () => {
  const root = await mkdtemp(join(tmpdir(), 'screen-agent-stdio-'))
  const client = new Client({ name: 'stdio-test', version: '1.0' })
  try {
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [resolve('dist/cli.js'), 'mcp', '--artifacts', root],
        stderr: 'pipe',
      }),
    )
    assert.equal((await client.listTools()).tools.length, 4)
    const result = await client.callTool({ name: 'list_runs', arguments: {} })
    assert.equal((result.content as { text: string }[])[0]!.text, '[]')
  } finally {
    await client.close()
    await rm(root, { recursive: true, force: true })
  }
})
