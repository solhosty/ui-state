import { buildLibrary, type SavedRun } from '../domain/library.js'
import { randomUUID } from 'node:crypto'
import { PageDiscovery } from '../infrastructure/page-discovery.js'
import { ArtifactStore } from '../infrastructure/artifact-store.js'
import { createReadStream } from 'node:fs'
import { access, readFile, readdir } from 'node:fs/promises'
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import { extname, resolve, sep } from 'node:path'
import type {
  RunArtifact,
  DiscoveryRun,
  DiscoveryRequest,
} from '../domain/contracts.js'
import { PlaywrightReplayer } from '../infrastructure/playwright-replayer.js'
import { dashboardHtml } from './view.js'
const serverVersion = Date.now().toString(36)

const contentTypes: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.html': 'text/html; charset=utf-8',
}

export function createDashboardServer(artifactRoot: string) {
  const root = resolve(artifactRoot)
  const jobs: Jobs = {}
  const server = createServer(async (request, response) => {
    try {
      await route(request, response, root, jobs)
    } catch (error) {
      respond(
        response,
        500,
        error instanceof Error ? error.message : String(error),
      )
    }
  })
  return server
}

export const DASHBOARD_PORT = 4174

export function startDashboard(artifactRoot: string): void {
  const port = DASHBOARD_PORT
  const server = createDashboardServer(artifactRoot)
  server.on('error', (error) => {
    console.error(
      (error as NodeJS.ErrnoException).code === 'EADDRINUSE'
        ? `Port ${port} is already in use. Open http://127.0.0.1:${port} or stop the existing server.`
        : error.message,
    )
    process.exitCode = 1
  })
  server.listen(port, '127.0.0.1', () =>
    console.log(`Screen Explorer dashboard: http://127.0.0.1:${port}`),
  )
}

interface Jobs {
  active?: { controller: AbortController; runId: string }
}

async function route(
  request: IncomingMessage,
  response: ServerResponse,
  root: string,
  jobs: Jobs,
): Promise<void> {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
  if (pathname === '/api/version')
    return respond(
      response,
      200,
      JSON.stringify({
        version: serverVersion,
        dev: process.env.SCREEN_EXPLORER_DEV === '1',
      }),
    )
  if (pathname === '/' || pathname === '/index.html')
    return respondHtml(response)
  if (pathname.startsWith('/api/') && request.method === 'POST') {
    const origin = request.headers.origin
    if (origin && origin !== `http://${request.headers.host}`)
      return respond(response, 403, 'Cross-origin actions are not allowed.')
  }
  if (pathname === '/api/explore' && request.method === 'POST') {
    if (jobs.active)
      return respond(response, 409, 'An exploration is already running.')
    if (!request.headers['content-type']?.startsWith('application/json'))
      return respond(response, 415, 'Expected JSON.')
    let body = ''
    for await (const chunk of request) {
      body += chunk
      if (body.length > 16000)
        return respond(response, 413, 'Request too large.')
    }
    let input: DiscoveryRequest
    try {
      input = JSON.parse(body)
      const url = new URL(input.targetUrl)
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error('Enter an HTTP or HTTPS URL without credentials.')
      if (
        input.maxPages !== undefined &&
        (!Number.isSafeInteger(input.maxPages) || input.maxPages < 1)
      )
        throw new Error('Page limit must be a positive integer.')
      if (
        input.requestUrl !== undefined &&
        (typeof input.requestUrl !== 'string' || !input.requestUrl.trim())
      )
        throw new Error('Request matcher must be nonempty text.')
      if (
        input.retrySelector !== undefined &&
        (typeof input.retrySelector !== 'string' || !input.retrySelector.trim())
      )
        throw new Error('Retry selector must be nonempty text.')
      if (
        input.sourceDirectory !== undefined &&
        typeof input.sourceDirectory !== 'string'
      )
        throw new Error('Source folder must be a path.')
    } catch (error) {
      return respond(
        response,
        400,
        error instanceof Error ? error.message : 'Invalid request.',
      )
    }
    // Reserve synchronously after body parsing; another request may have started meanwhile.
    if (jobs.active)
      return respond(response, 409, 'An exploration is already running.')
    const controller = new AbortController(),
      runId = 'run_' + randomUUID()
    jobs.active = { controller, runId }
    void new PageDiscovery(new ArtifactStore(root, runId))
      .explore(input, controller.signal)
      .catch((error) => console.error('Exploration failed:', error))
      .finally(() => {
        delete jobs.active
      })
    return respond(response, 202, JSON.stringify({ runId }))
  }
  if (pathname === '/api/explore/stop' && request.method === 'POST') {
    jobs.active?.controller.abort()
    return respond(
      response,
      202,
      'Stopping exploration; completed captures are preserved.',
    )
  }
  if (pathname === '/api/workspaces') {
    const runs = await readRuns(root)
    const workspaces = new Map<
      string,
      { origin: string; target: string; lastCaptured: string; runs: number }
    >()
    for (const run of runs.sort((a, b) =>
      b.startedAt.localeCompare(a.startedAt),
    )) {
      const existing = workspaces.get(run.target.origin)
      if (existing) existing.runs++
      else
        workspaces.set(run.target.origin, {
          origin: run.target.origin,
          target: run.target.url,
          lastCaptured: run.startedAt,
          runs: 1,
        })
    }
    return respond(response, 200, JSON.stringify([...workspaces.values()]))
  }
  if (pathname === '/api/library') {
    const runs = await readRuns(root)
    const requestUrl = new URL(request.url!, 'http://localhost')
    const selected = requestUrl.searchParams.get('run') ?? undefined
    const target = requestUrl.searchParams.get('target') ?? undefined
    let normalizedTarget: string | undefined
    if (target) {
      try {
        const value = new URL(target)
        if (
          !['http:', 'https:'].includes(value.protocol) ||
          value.username ||
          value.password
        )
          throw new Error()
        value.hash = ''
        normalizedTarget = value.href
      } catch {
        return respond(response, 400, 'Invalid app URL.')
      }
    }
    const library = buildLibrary(runs, selected, normalizedTarget)
    return respond(
      response,
      library ? 200 : 404,
      JSON.stringify(library ?? { error: 'No captures found.' }),
    )
  }
  if (pathname === '/api/progress') {
    const active = jobs.active?.runId ?? null
    const run = active
      ? await readFile(resolve(root, 'runs', active, 'run.json'), 'utf8')
          .then((raw) => JSON.parse(raw) as DiscoveryRun)
          .catch(() => undefined)
      : undefined
    return respond(
      response,
      200,
      JSON.stringify({
        active,
        activity: run?.activity,
        target: run?.target,
        startedAt: run?.startedAt,
        captured: run?.routes.filter((route) => route.observations.length)
          .length,
        discovered: run?.routes.length,
      }),
    )
  }
  if (pathname === '/api/replay' && request.method === 'POST')
    return replay(request, response, root)
  if (!pathname.startsWith('/artifacts/'))
    return respond(response, 404, 'Not found')
  if (
    !/^\/artifacts\/(?:latest-run\.json|runs\/run_[a-zA-Z0-9_-]+\/(?:run\.json|screenshots\/[a-zA-Z0-9_-]+\.png))$/.test(
      pathname,
    )
  )
    return respond(response, 404, 'Artifact not found')
  const requested = resolve(root, pathname.slice('/artifacts/'.length))
  if (!requested.startsWith(`${root}${sep}`) && requested !== root)
    return respond(response, 403, 'Forbidden')
  try {
    await access(requested)
    response.writeHead(200, {
      'content-type':
        contentTypes[extname(requested)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    })
    createReadStream(requested).pipe(response)
  } catch {
    respond(response, 404, 'Artifact not found')
  }
}

async function replay(
  request: IncomingMessage,
  response: ServerResponse,
  root: string,
): Promise<void> {
  const observation = new URL(
    request.url ?? '/',
    'http://localhost',
  ).searchParams.get('observation')
  if (!observation) return respond(response, 400, 'Observation is required')
  try {
    const requestedRun = new URL(
      request.url!,
      'http://localhost',
    ).searchParams.get('run')
    if (requestedRun && !/^run_[a-zA-Z0-9_-]+$/.test(requestedRun))
      return respond(response, 400, 'Invalid run identifier.')
    const run = JSON.parse(
      await readFile(
        requestedRun
          ? resolve(root, 'runs', requestedRun, 'run.json')
          : resolve(root, 'latest-run.json'),
        'utf8',
      ),
    ) as RunArtifact | DiscoveryRun
    if (run.schemaVersion === 6)
      return respond(
        response,
        409,
        'This run contains screenshots only, without controlled replay fixtures.',
      )
    const replayer = new PlaywrightReplayer()
    const result = await replayer.open(
      run,
      resolve(root, 'runs', run.runId),
      observation,
    )
    const outcome =
      result.verification.status === 'matched'
        ? 'Replay opened in the browser; DOM text matches the captured observation.'
        : `Replay opened in the browser, but DOM text did not match: ${result.verification.reason}`
    respond(
      response,
      result.verification.status === 'matched' ? 202 : 409,
      outcome,
    )
  } catch (error) {
    respond(
      response,
      422,
      error instanceof Error ? error.message : String(error),
    )
  }
}

function respond(response: ServerResponse, status: number, body: string): void {
  response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
  response.end(body)
}

function respondHtml(response: ServerResponse): void {
  response.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
  })
  response.end(dashboardHtml)
}

async function readRuns(root: string): Promise<SavedRun[]> {
  const entries = await readdir(resolve(root, 'runs'), {
    withFileTypes: true,
  }).catch(() => [])
  return (
    await Promise.all(
      entries
        .filter((e) => e.isDirectory())
        .map(async (entry) => {
          try {
            return JSON.parse(
              await readFile(
                resolve(root, 'runs', entry.name, 'run.json'),
                'utf8',
              ),
            ) as SavedRun
          } catch {
            return undefined
          }
        }),
    )
  ).filter(
    (run): run is SavedRun => !!run && [5, 6].includes(run.schemaVersion),
  )
}
