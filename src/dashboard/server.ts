import { buildLibrary, type SavedRun } from '../domain/library.js'
import { randomUUID } from 'node:crypto'
import { PageDiscovery } from '../infrastructure/page-discovery.js'
import { ArtifactStore } from '../infrastructure/artifact-store.js'
import { createReadStream } from 'node:fs'
import { access, readFile, readdir } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import type { RunArtifact, DiscoveryRun, DiscoveryRequest } from '../domain/contracts.js'
import { PlaywrightReplayer } from '../infrastructure/playwright-replayer.js'
import { dashboardHtml } from './view.js'

const contentTypes: Record<string, string> = { '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.html': 'text/html; charset=utf-8' }

export function createDashboardServer(artifactRoot: string) {
  const root = resolve(artifactRoot)
  const jobs: Jobs = {}
  const server = createServer(async (request, response) => {
    try { await route(request, response, root, jobs) }
    catch (error) { respond(response, 500, error instanceof Error ? error.message : String(error)) }
  })
  return server
}

export function startDashboard(artifactRoot: string, port: number): void {
  createDashboardServer(artifactRoot).listen(port, '127.0.0.1', () => console.log(`Screen Explorer dashboard: http://127.0.0.1:${port}`))
}

interface Jobs { active?: { controller: AbortController; runId: string } }

async function route(request: IncomingMessage, response: ServerResponse, root: string, jobs: Jobs): Promise<void> {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
  if (pathname === '/' || pathname === '/index.html') return respondHtml(response)
  if (pathname.startsWith('/api/') && request.method === 'POST') {
    const origin = request.headers.origin
    if (origin && origin !== `http://${request.headers.host}`) return respond(response, 403, 'Cross-origin actions are not allowed.')
  }
  if (pathname === '/api/explore' && request.method === 'POST') {
    if (jobs.active) return respond(response, 409, 'An exploration is already running.')
    if (!request.headers['content-type']?.startsWith('application/json')) return respond(response, 415, 'Expected JSON.')
    let body = ''
    for await (const chunk of request) { body += chunk; if (body.length > 16000) return respond(response, 413, 'Request too large.') }
    let input: DiscoveryRequest
    try {
      input = JSON.parse(body)
      const url = new URL(input.targetUrl)
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Enter an HTTP or HTTPS URL without credentials.')
      if (input.maxPages !== undefined && (!Number.isSafeInteger(input.maxPages) || input.maxPages < 1)) throw new Error('Page limit must be a positive integer.')
      if (input.sourceDirectory !== undefined && typeof input.sourceDirectory !== 'string') throw new Error('Source folder must be a path.')
    } catch (error) { return respond(response, 400, error instanceof Error ? error.message : 'Invalid request.') }
    // Reserve synchronously after body parsing; another request may have started meanwhile.
    if (jobs.active) return respond(response, 409, 'An exploration is already running.')
    const controller = new AbortController(), runId = 'run_' + randomUUID()
    jobs.active = { controller, runId }
    void new PageDiscovery(new ArtifactStore(root, runId)).explore(input, controller.signal)
      .catch(error => console.error('Exploration failed:', error)).finally(() => { delete jobs.active })
    return respond(response, 202, JSON.stringify({ runId }))
  }
  if (pathname === '/api/explore/stop' && request.method === 'POST') {
    jobs.active?.controller.abort()
    return respond(response, 202, 'Stopping exploration; completed captures are preserved.')
  }
  if (pathname === '/api/library') {
    const entries = await readdir(resolve(root, 'runs'), { withFileTypes: true }).catch(() => [])
    const runs = (await Promise.all(entries.filter(e => e.isDirectory()).map(async entry => {
      try { return JSON.parse(await readFile(resolve(root, 'runs', entry.name, 'run.json'), 'utf8')) as SavedRun } catch { return undefined }
    }))).filter((run): run is SavedRun => !!run && [5,6].includes(run.schemaVersion))
    const selected = new URL(request.url!, 'http://localhost').searchParams.get('run') ?? undefined
    const library = buildLibrary(runs, selected)
    return respond(response, library ? 200 : 404, JSON.stringify(library ?? { error: 'No captures found.' }))
  }
  if (pathname === '/api/progress') return respond(response, 200, JSON.stringify({ active: jobs.active?.runId ?? null }))
  if (pathname === '/api/replay' && request.method === 'POST') return replay(request, response, root)
  if (!pathname.startsWith('/artifacts/')) return respond(response, 404, 'Not found')
  if (!/^\/artifacts\/(?:latest-run\.json|runs\/run_[a-zA-Z0-9_-]+\/(?:run\.json|screenshots\/[a-zA-Z0-9_-]+\.png))$/.test(pathname)) return respond(response, 404, 'Artifact not found')
  const requested = resolve(root, pathname.slice('/artifacts/'.length))
  if (!requested.startsWith(`${root}${sep}`) && requested !== root) return respond(response, 403, 'Forbidden')
  try {
    await access(requested)
    response.writeHead(200, { 'content-type': contentTypes[extname(requested)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
    createReadStream(requested).pipe(response)
  } catch { respond(response, 404, 'Artifact not found') }
}

async function replay(request: IncomingMessage, response: ServerResponse, root: string): Promise<void> {
  const observation = new URL(request.url ?? '/', 'http://localhost').searchParams.get('observation')
  if (!observation) return respond(response, 400, 'Observation is required')
  try {
    const requestedRun = new URL(request.url!, 'http://localhost').searchParams.get('run')
    if (requestedRun && !/^run_[a-zA-Z0-9_-]+$/.test(requestedRun)) return respond(response, 400, 'Invalid run identifier.')
    const run = JSON.parse(await readFile(requestedRun ? resolve(root, 'runs', requestedRun, 'run.json') : resolve(root, 'latest-run.json'), 'utf8')) as RunArtifact | DiscoveryRun
    if (run.schemaVersion === 6) return respond(response, 409, 'This run contains screenshots only, without controlled replay fixtures.')
    const replayer = new PlaywrightReplayer()
    const result = await replayer.open(run, resolve(root, 'runs', run.runId), observation)
    const outcome = result.verification.status === 'matched'
      ? 'Replay opened in Chrome; DOM text matches the captured observation.'
      : `Replay opened in Chrome, but DOM text did not match: ${result.verification.reason}`
    respond(response, result.verification.status === 'matched' ? 202 : 409, outcome)
  } catch (error) { respond(response, 422, error instanceof Error ? error.message : String(error)) }
}

function respond(response: ServerResponse, status: number, body: string): void {
  response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  response.end(body)
}

function respondHtml(response: ServerResponse): void {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
  response.end(dashboardHtml)
}
