import { PlaywrightExplorer } from './playwright-explorer.js'
import { dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright'
import { viewportPresets, type DiscoveryRequest, type DiscoveryRun, type ObservationPreview } from '../domain/contracts.js'
import { candidateUrl, isDynamic, routePattern, resolveTemplate } from '../domain/discovery.js'
import { ArtifactStore } from './artifact-store.js'
import { discoverSourceRoutes } from './source-routes.js'

export class PageDiscovery {
  constructor(private readonly store: ArtifactStore) {}
  async explore(input: DiscoveryRequest, signal: AbortSignal): Promise<DiscoveryRun> {
    const target = new URL(input.targetUrl)
    const run: DiscoveryRun = { schemaVersion: 6, mode: 'screenshots', runId: this.store.runId,
      target: { url: target.href, origin: target.origin }, startedAt: new Date().toISOString(),
      status: 'running', routes: [], sourceRoutes: [], notes: [], observations: [] }
    const known = new Set<string>()
    const experimentCandidates = new Map<string, string>()
    const enqueue = (value: string, base: string, source: 'start' | 'link' | 'seed') => {
      const url = candidateUrl(value, base)
      if (!url || known.has(url)) return
      known.add(url)
      run.routes.push({ id: 'route_' + run.routes.length, label: new URL(url).pathname + new URL(url).search + new URL(url).hash,
        url, source, coverage: { status: 'queued' }, observations: [] })
    }
    enqueue(target.href, target.href, 'start')
    await this.store.writeRun(run)
    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined
    try {
      if (input.sourceDirectory) {
        const result = await discoverSourceRoutes(input.sourceDirectory)
        run.sourceRoutes = result.routes; run.notes.push(...result.notes)
        for (const hint of run.sourceRoutes) if (!isDynamic(hint.template)) enqueue(hint.template, target.href, 'seed')
        await this.store.writeRun(run)
      }
      if (signal.aborted) throw new Error('Exploration stopped.')
      browser = await chromium.launch({ headless: true, ...(existsSync(executablePath) ? { executablePath } : {}) })
      const stop = () => { void browser?.close().catch(() => {}) }
      signal.addEventListener('abort', stop, { once: true })
      try {
        let visited = 0
        for (const route of run.routes) {
          if (signal.aborted) break
          if (input.maxPages && visited >= input.maxPages) { run.notes.push(`Page limit reached (${input.maxPages}). Remaining routes are queued.`); break }
          visited++
          route.coverage = { status: 'capturing' }; await this.store.writeRun(run)
          const context = await browser.newContext({ serviceWorkers: 'block' })
          try {
            // Read-only exploration. Never submit forms or follow cross-origin document redirects.
            await context.route('**/*', intercepted => {
              const request = intercepted.request()
              if (!['GET','HEAD','OPTIONS'].includes(request.method())) return intercepted.abort()
              if (request.isNavigationRequest() && new URL(request.url()).origin !== target.origin) return intercepted.abort()
              return intercepted.continue()
            })
            const page = await context.newPage()
            const candidates = new Map<string, number>()
            const pending: Promise<void>[] = []
            page.on('response', response => {
              if (response.request().method() !== 'GET' || !response.ok() || !response.headers()['content-type']?.includes('application/json') || pending.length >= 30) return
              pending.push((async () => {
                try {
                  const body = await response.body()
                  if (body.length > 2_000_000) return
                  const data: unknown = JSON.parse(body.toString())
                  const collection = Array.isArray(data) || (!!data && typeof data === 'object' && Object.values(data).some(Array.isArray))
                  if (collection) candidates.set(response.url(), body.length)
                } catch {}
              })())
            })
            const previews: ObservationPreview[] = []
            let needsAuth = false
            for (const viewport of viewportPresets) {
              if (signal.aborted) break
              await page.setViewportSize({ width: viewport.width, height: viewport.height })
              const response = await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 20000 })
              if (response && response.status() >= 400) throw new Error(`Page returned HTTP ${response.status()}.`)
              await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {})
              needsAuth ||= /\/(login|sign-?in|auth)(\/|$)/i.test(new URL(page.url()).pathname) && page.url() !== route.url
              const links = await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).href))
              for (const link of links) {
                enqueue(link, page.url(), 'link')
                if (new URL(link).origin === target.origin) for (const hint of run.sourceRoutes) {
                  const resolved = resolveTemplate(hint.template, link)
                  if (resolved) enqueue(resolved, target.href, 'seed')
                }
              }
              const visibleText = await page.locator('body').innerText({ timeout: 5000 })
              const headings = await page.locator('h1, h2, [role="alert"]').allTextContents()
              if (headings.some(text => /^(?:404(?:\s|$)|not found|page not found|unexpected application error|application error)/i.test(text.trim()))) throw new Error('The app rendered an error or not-found page.')
              if (!visibleText.trim()) throw new Error('The page rendered no visible text; capture could not be verified.')
              previews.push({ viewport, screenshot: await this.store.writeScreenshot(`${route.id}-${viewport.id}`, await page.screenshot({ fullPage: true, timeout: 10000 })), visibleText: visibleText.slice(0, 12000), domHash: ArtifactStore.sha256(visibleText) })
            }
            await Promise.allSettled(pending)
            if (candidates.size === 1) experimentCandidates.set(route.url, [...candidates.keys()][0]!)
            else if (candidates.size > 1) run.notes.push(`${route.label}: multiple JSON collections observed; automatic state experiments skipped.`)
            if (previews.length) {
              const preview = previews.find(p => p.viewport.id === 'desktop') ?? previews[0]!
              route.observations = [{ id: 'baseline', label: 'Page capture', condition: 'Live page · no response modifications', capturedAt: new Date().toISOString(),
                screenshot: preview.screenshot, visibleText: preview.visibleText, domHash: preview.domHash, previews, intervention: { kind: 'baseline' }, actions: [],
                replay: { status: 'captured', attempts: 1, reason: 'Screenshot capture only; no controlled replay fixture.' } }]
              route.coverage = needsAuth ? { status: 'needs-auth', reason: 'Redirected to sign-in. Captured the sign-in screen.' } : { status: 'captured' }
              if (!needsAuth) for (const hint of run.sourceRoutes) if (routePattern(hint.template).test(new URL(route.url).pathname)
                && !(isDynamic(hint.template) && run.sourceRoutes.some(other => !isDynamic(other.template) && routePattern(other.template).test(new URL(route.url).pathname)))) {
                hint.status = 'resolved'; if (!hint.examples.includes(route.url)) hint.examples.push(route.url)
              }
            } else route.coverage = { status: 'queued', reason: 'Stopped before capture.' }
          } catch (error) {
            route.coverage = { status: signal.aborted ? 'queued' : 'unreachable', reason: signal.aborted ? 'Stopped before capture completed.' : error instanceof Error ? error.message : String(error) }
          } finally { await context.close().catch(() => {}) }
          run.observations = run.routes.flatMap(r => r.observations)
          await this.store.writeRun(run)
        }
      } finally { signal.removeEventListener('abort', stop) }
      for (const route of run.routes) {
        if (signal.aborted) break
        const requestUrl = experimentCandidates.get(route.url)
        if (!requestUrl || route.coverage.status !== 'captured') continue
        const message = `Testing loading, empty, error and recovery states for ${route.label}`
        run.notes.push(message); await this.store.writeRun(run)
        try {
          const child = new ArtifactStore(dirname(dirname(this.store.runDirectory)), `${run.runId}_${route.id}_states`, false)
          await new PlaywrightExplorer(child).explore({ targetUrl: route.url, request: { method: 'GET', urlIncludes: requestUrl }, autoRetry: true, headed: false }, signal)
        } catch (error) { run.notes.push(`${route.label}: state experiments failed: ${error instanceof Error ? error.message : String(error)}`) }
        run.notes = run.notes.filter(note => note !== message)
        await this.store.writeRun(run)
      }
      run.status = signal.aborted ? 'stopped' : 'complete' 
    } catch (error) {
      run.status = signal.aborted ? 'stopped' : 'failed'
      if (!signal.aborted) run.error = error instanceof Error ? error.message : String(error)
    } finally {
      await browser?.close().catch(() => {})
      run.completedAt = new Date().toISOString()
      await this.store.writeRun(run)
    }
    return run
  }
}
