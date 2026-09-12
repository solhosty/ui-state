#!/usr/bin/env node
import { startAgentServer } from './agent-server.js'
import { PageDiscovery } from './infrastructure/page-discovery.js'
import { resolve } from 'node:path'
import type { ExplorationRequest } from './domain/contracts.js'
import { ArtifactStore } from './infrastructure/artifact-store.js'
import { PlaywrightExplorer } from './infrastructure/playwright-explorer.js'
import { captureSessionState } from './infrastructure/session-capture.js'
import { startDashboard } from './dashboard/server.js'

const [, , command, ...args] = process.argv

function option(name: string): string | undefined {
  const index = args.indexOf(name)
  return index === -1 ? undefined : args[index + 1]
}

function options(name: string): string[] {
  return args.flatMap((value, index) =>
    value === name && args[index + 1] ? [args[index + 1]!] : [],
  )
}

function usage(): never {
  console.error(
    'Usage: screen-explorer login --target <url> --session <local-state.json>',
  )
  console.error(
    '       screen-explorer explore --target <url> --request-url <stable path fragment> [--retry <selector>] [--route <hidden-route-url>] [--session <local-state.json>] [--headed]',
  )
  console.error('       screen-explorer dashboard [--artifacts <directory>]')
  console.error('       screen-explorer mcp [--artifacts <directory>]')
  process.exit(1)
}

if (command === 'mcp') {
  await startAgentServer(resolve(option('--artifacts') ?? '.screen-explorer'))
} else if (command === 'login') {
  const targetUrl = option('--target')
  const sessionPath = option('--session')
  if (!targetUrl || !sessionPath) usage()
  new URL(targetUrl)
  captureSessionState(targetUrl, resolve(sessionPath)).catch((error) => {
    console.error(
      `Session capture failed: ${error instanceof Error ? error.message : String(error)}`,
    )
    process.exitCode = 1
  })
} else if (command === 'dashboard') {
  if (args.some((arg) => arg === '--port' || arg.startsWith('--port='))) {
    console.error(
      'Screen Explorer always uses http://localhost:4174. Port overrides are not supported. Reuse or restart the existing dashboard.',
    )
    process.exit(1)
  }
  startDashboard(resolve(option('--artifacts') ?? '.screen-explorer'))
} else if (command !== 'explore') usage()
else {
  const targetUrl = option('--target')
  const urlIncludes = option('--request-url')
  if (!targetUrl) usage()
  new URL(targetUrl)

  if (!urlIncludes) {
    const maxPages = option('--max-pages')
      ? Number(option('--max-pages'))
      : undefined
    if (
      maxPages !== undefined &&
      (!Number.isSafeInteger(maxPages) || maxPages < 1)
    )
      throw new Error('--max-pages must be a positive integer.')
    const sourceDirectory = option('--source')
    const controller = new AbortController()
    process.once('SIGINT', () => controller.abort())
    const store = new ArtifactStore(
      resolve('.screen-explorer'),
      'run_' + Date.now(),
    )
    const run = await new PageDiscovery(store).explore(
      {
        targetUrl,
        ...(maxPages ? { maxPages } : {}),
        ...(sourceDirectory
          ? { sourceDirectory: resolve(sourceDirectory) }
          : {}),
      },
      controller.signal,
    )
    console.log(
      `${run.status}: ${run.observations.length} pages captured, ${run.routes.length} discovered.`,
    )
    if (run.status === 'failed') {
      console.error(run.error)
      process.exitCode = 1
    }
  } else {
    const retrySelector = option('--retry')
    const sessionPath = option('--session')
    const routeSeeds = options('--route')
    const request: ExplorationRequest = {
      targetUrl,
      request: { method: 'GET', urlIncludes },
      ...(retrySelector ? { retrySelector } : {}),
      ...(sessionPath ? { sessionStatePath: resolve(sessionPath) } : {}),
      ...(routeSeeds.length ? { routeSeeds } : {}),
      headed: args.includes('--headed'),
    }
    const runId = `run_${new Date()
      .toISOString()
      .replace(/[-:.TZ]/g, '')
      .slice(0, 14)}`
    const artifacts = new ArtifactStore(resolve('.screen-explorer'), runId)
    const explorer = new PlaywrightExplorer(artifacts)

    try {
      const run = await explorer.explore(request)
      const complete = run.observations.filter(
        (observation) =>
          observation.replay.status === 'captured' ||
          observation.replay.status === 'matched',
      ).length
      console.log(
        `Captured ${complete}/${run.observations.length} observations in ${artifacts.runDirectory}`,
      )
    } catch (error) {
      console.error(
        `Screen Explorer failed: ${error instanceof Error ? error.message : String(error)}`,
      )
      process.exitCode = 1
    }
  }
}
