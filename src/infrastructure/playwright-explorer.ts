import { PlaywrightReplayer } from './playwright-replayer.js'
import { existsSync } from 'node:fs'
import { chromium, type Browser, type Page, type Route } from 'playwright'
import {
  viewportPresets,
  type CapturedResponse,
  type ExplorationRequest,
  type Observation,
  type ObservationKind,
  type ObservationPreview,
  type RouteArtifact,
  type RunArtifact,
  type ViewportPreset,
} from '../domain/contracts.js'
import { emptyFirstCollection } from '../domain/fixtures.js'
import { ArtifactStore } from './artifact-store.js'

const chromeExecutable =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const loadingCaptureDelayMs = 650
const artificialDelayMs = 1_500

export class PlaywrightExplorer {
  constructor(private readonly artifacts: ArtifactStore) {}

  async explore(
    request: ExplorationRequest,
    signal?: AbortSignal,
    onProgress?: (detail: string) => Promise<void>,
  ): Promise<RunArtifact> {
    const target = new URL(request.targetUrl)
    const browser = await chromium.launch({
      headless: !request.headed,
      ...(existsSync(chromeExecutable)
        ? { executablePath: chromeExecutable }
        : {}),
    })
    const stop = () => {
      void browser.close().catch(() => {})
    }
    signal?.addEventListener('abort', stop, { once: true })
    try {
      signal?.throwIfAborted()
      await onProgress?.('Capturing baseline state')
      const baseline = await this.captureBaseline(browser, request)
      const fixturePath = await this.artifacts.writeFixture(baseline.response)
      const observations: Observation[] = [baseline.observation]
      await onProgress?.('Capturing loading state')
      observations.push(
        await this.captureDelayed(browser, request, baseline.response),
      )
      await onProgress?.('Capturing empty state')
      observations.push(
        await this.captureEmpty(browser, request, baseline.response),
      )
      await onProgress?.('Capturing failure state')
      observations.push(
        await this.captureFailure(browser, request, baseline.response),
      )
      await onProgress?.('Capturing recovery state')
      observations.push(
        await this.captureRecovery(browser, request, baseline.response),
      )
      const completedAt = new Date().toISOString()
      const run: RunArtifact = {
        schemaVersion: 5,
        runId: this.artifacts.runId,
        target: { url: request.targetUrl, origin: target.origin },
        request: {
          method: 'GET',
          url: baseline.response.url,
          match: request.request,
          fixturePath,
          fixtureSha256: ArtifactStore.sha256(baseline.response.body),
        },
        startedAt: baseline.observation.capturedAt,
        completedAt,
        observations,
        routes: this.routeArtifacts(request, baseline.routes, observations),
        authentication: request.sessionStatePath
          ? {
              mode: 'playwright-storage-state',
              sessionStatePath: request.sessionStatePath,
            }
          : { mode: 'none' },
        limits: {
          responseInterception: 'explicit-read-only-get',
          outgoingWrites: 'blocked',
          serviceWorkers: 'unsupported',
          realtime: 'unsupported',
        },
      }
      await this.artifacts.writeRun(run)
      for (const observation of observations) {
        signal?.throwIfAborted()
        if (
          observation.replay.status === 'captured' ||
          observation.replay.status === 'matched'
        ) {
          await onProgress?.(
            'Capturing ' + observation.label + ' at four viewport sizes',
          )
          observation.previews = await this.capturePreviews(
            browser,
            request,
            baseline.response,
            observation,
          )
          const desktop = observation.previews.find(
            (p) => p.viewport.id === 'desktop',
          )!
          observation.screenshot = desktop.screenshot
          observation.visibleText = desktop.visibleText
          observation.domHash = desktop.domHash
          await this.artifacts.writeRun(run)
        }
      }
      for (const observation of observations) {
        signal?.throwIfAborted()
        if (!observation.previews?.length) continue
        try {
          await onProgress?.('Verifying ' + observation.label + ' replay')
          const replay = await new PlaywrightReplayer().open(
            run,
            this.artifacts.runDirectory,
            observation.id,
            true,
          )
          observation.replay = {
            status: replay.verification.status,
            attempts: 1,
            outcomeDomHash: replay.verification.actualDomHash,
            ...(replay.verification.reason
              ? { reason: replay.verification.reason }
              : {}),
          }
          await replay.browser.close()
        } catch (error) {
          observation.replay = {
            status: 'failed',
            attempts: 1,
            reason: error instanceof Error ? error.message : String(error),
          }
        }
      }
      run.completedAt = new Date().toISOString()
      await this.artifacts.writeRun(run)
      return run
    } finally {
      signal?.removeEventListener('abort', stop)
      await browser.close().catch(() => {})
    }
  }

  private async captureBaseline(
    browser: Browser,
    request: ExplorationRequest,
  ): Promise<{
    observation: Observation
    response: CapturedResponse
    routes: string[]
  }> {
    const context = await browser.newContext(
      this.contextOptions(request, this.desktopViewport()),
    )
    await context.route('**/*', (route) =>
      ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())
        ? route.continue()
        : route.abort(),
    )
    const page = await context.newPage()
    try {
      const responsePromise = page.waitForResponse(
        (response) =>
          this.matches(response.url(), response.request().method(), request),
        { timeout: 30_000 },
      )
      await page.goto(request.targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })
      const response = await responsePromise
      const captured = await this.toCapturedResponse(
        response.url(),
        response.request().method(),
        response.status(),
        response.headers()['content-type'] ?? '',
        await response.body(),
      )
      const observation = await this.snapshot(
        page,
        'baseline',
        'Baseline',
        'captured response',
        'captured',
        1,
      )
      const routes = await page
        .locator('a[href]')
        .evaluateAll((anchors) =>
          anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
        )
      return { observation, response: captured, routes }
    } finally {
      await context.close()
    }
  }

  private async captureDelayed(
    browser: Browser,
    request: ExplorationRequest,
    fixture: CapturedResponse,
  ): Promise<Observation> {
    return this.withInterception(
      browser,
      request,
      fixture,
      'loading',
      'Loading',
      `delayed ${artificialDelayMs} ms`,
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, artificialDelayMs))
        await this.fulfill(route, fixture)
      },
      async (page) => {
        await new Promise((resolve) =>
          setTimeout(resolve, loadingCaptureDelayMs),
        )
      },
      loadingCaptureDelayMs,
    )
  }

  private async captureEmpty(
    browser: Browser,
    request: ExplorationRequest,
    fixture: CapturedResponse,
  ): Promise<Observation> {
    const empty = emptyFirstCollection(fixture.body)
    if (!empty)
      return this.unsupported(
        'empty',
        'Empty collection',
        'captured response contains no collection',
      )
    return this.withInterception(
      browser,
      request,
      fixture,
      'empty',
      'Empty collection',
      'first captured collection replaced with []',
      (route) => this.fulfill(route, fixture, empty),
      undefined,
      500,
    )
  }

  private async captureFailure(
    browser: Browser,
    request: ExplorationRequest,
    fixture: CapturedResponse,
  ): Promise<Observation> {
    return this.withInterception(
      browser,
      request,
      fixture,
      'failed',
      'Request failed',
      'synthetic 500 response',
      (route) =>
        this.fulfill(
          route,
          fixture,
          Buffer.from('{"error":"Screen Explorer injected failure"}'),
          500,
        ),
      undefined,
      3_000,
    )
  }

  private async captureRecovery(
    browser: Browser,
    request: ExplorationRequest,
    fixture: CapturedResponse,
  ): Promise<Observation> {
    if (!request.retrySelector && request.autoRetry) {
      const retrySelector =
        'button:has-text("Retry"),button:has-text("Try again")'
      if (
        !(await this.hasRetryControl(browser, request, fixture, retrySelector))
      ) {
        return this.unsupported(
          'recovered',
          'Recovered',
          'no visible retry control was found',
        )
      }
      request = { ...request, retrySelector }
    }
    if (!request.retrySelector)
      return this.unsupported(
        'recovered',
        'Recovered',
        'no retry selector was supplied',
      )
    // Dev-mode React may issue more than one initial request. Keep every request
    // failed until the recorded user action deliberately enables recovery.
    let recoveryEnabled = false
    return this.withInterception(
      browser,
      request,
      fixture,
      'recovered',
      'Recovered',
      'first response fails; configured retry restores captured response',
      async (route) => {
        await this.fulfill(
          route,
          fixture,
          recoveryEnabled
            ? fixture.body
            : Buffer.from('{"error":"Screen Explorer injected failure"}'),
          recoveryEnabled ? fixture.status : 500,
        )
      },
      async (page) => {
        await page
          .locator(request.retrySelector!)
          .waitFor({ state: 'visible', timeout: 10_000 })
        recoveryEnabled = true
        await page.locator(request.retrySelector!).click({ timeout: 10_000 })
        await page.waitForTimeout(750)
      },
      750,
    )
  }

  private async hasRetryControl(
    browser: Browser,
    request: ExplorationRequest,
    fixture: CapturedResponse,
    selector: string,
  ): Promise<boolean> {
    const context = await browser.newContext(
      this.contextOptions(request, this.desktopViewport()),
    )
    await context.route('**/*', (route) =>
      ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())
        ? route.continue()
        : route.abort(),
    )
    await context.route('**/*', (route) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()))
        return route.abort()
      return this.matchesCapturedResponse(
        route.request().url(),
        route.request().method(),
        fixture,
      )
        ? this.fulfill(
            route,
            fixture,
            Buffer.from('{"error":"Screen Explorer injected failure"}'),
            500,
          )
        : route.continue()
    })
    const page = await context.newPage()
    try {
      await page.goto(request.targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })
      await page
        .locator(selector)
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
      return true
    } catch {
      return false
    } finally {
      await context.close()
    }
  }

  private async withInterception(
    browser: Browser,
    request: ExplorationRequest,
    fixture: CapturedResponse,
    id: ObservationKind,
    label: string,
    condition: string,
    handler: (route: Route) => Promise<void>,
    afterNavigation?: (page: Page) => Promise<void>,
    settleDelayMs = 500,
  ): Promise<Observation> {
    const context = await browser.newContext(
      this.contextOptions(request, this.desktopViewport()),
    )
    await context.route('**/*', (route) =>
      ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())
        ? route.continue()
        : route.abort(),
    )
    const page = await context.newPage()
    try {
      await page.route('**/*', (route) =>
        !['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())
          ? route.abort()
          : this.matchesCapturedResponse(
                route.request().url(),
                route.request().method(),
                fixture,
              )
            ? handler(route)
            : route.continue(),
      )
      await page.goto(request.targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })
      if (afterNavigation) await afterNavigation(page)
      else await new Promise((resolve) => setTimeout(resolve, settleDelayMs))
      return await this.snapshot(
        page,
        id,
        label,
        condition,
        'captured',
        1,
        id === 'recovered' && request.retrySelector
          ? [{ kind: 'click', selector: request.retrySelector }]
          : [],
      )
    } catch (error) {
      return {
        id,
        label,
        condition,
        capturedAt: new Date().toISOString(),
        intervention: this.interventionFor(id),
        actions: [],
        replay: {
          status: 'failed',
          attempts: 1,
          reason: error instanceof Error ? error.message : String(error),
        },
      }
    } finally {
      await context.close()
    }
  }

  private async snapshot(
    page: Page,
    id: ObservationKind,
    label: string,
    condition: string,
    status: 'captured' | 'matched',
    attempts: number,
    actions: Observation['actions'] = [],
  ): Promise<Observation> {
    const image = await page.screenshot({ fullPage: true })
    const visibleText = await page.locator('body').innerText()
    return {
      id,
      label,
      condition,
      screenshot: await this.artifacts.writeScreenshot(id, image),
      visibleText: visibleText.slice(0, 12_000),
      domHash: ArtifactStore.sha256(visibleText),
      capturedAt: new Date().toISOString(),
      intervention: this.interventionFor(id),
      actions,
      replay: {
        status,
        attempts,
        outcomeDomHash: ArtifactStore.sha256(visibleText),
      },
    }
  }

  private async capturePreviews(
    browser: Browser,
    request: ExplorationRequest,
    fixture: CapturedResponse,
    observation: Observation,
  ): Promise<ObservationPreview[]> {
    const previews: ObservationPreview[] = []
    for (const viewport of viewportPresets)
      previews.push(
        await this.capturePreview(
          browser,
          request,
          fixture,
          observation,
          viewport,
        ),
      )
    return previews
  }

  private async capturePreview(
    browser: Browser,
    request: ExplorationRequest,
    fixture: CapturedResponse,
    observation: Observation,
    viewport: ViewportPreset,
  ): Promise<ObservationPreview> {
    const context = await browser.newContext(
      this.contextOptions(request, {
        width: viewport.width,
        height: viewport.height,
      }),
    )
    await context.route('**/*', (route) =>
      ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())
        ? route.continue()
        : route.abort(),
    )
    const page = await context.newPage()
    let recoveryEnabled = false
    try {
      await page.route('**/*', (route) => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()))
          return route.abort()
        if (
          !this.matchesCapturedResponse(
            route.request().url(),
            route.request().method(),
            fixture,
          )
        )
          return route.continue()
        if (observation.intervention.kind === 'delay')
          return this.delayAndFulfill(
            route,
            fixture,
            observation.intervention.delayMs ?? artificialDelayMs,
          )
        if (observation.intervention.kind === 'empty-collection') {
          const empty = emptyFirstCollection(fixture.body)
          if (!empty)
            throw new Error(
              'Captured response contains no collection to empty.',
            )
          return this.fulfill(route, fixture, empty)
        }
        if (observation.intervention.kind === 'failure')
          return this.fulfill(
            route,
            fixture,
            Buffer.from('{"error":"Screen Explorer injected failure"}'),
            observation.intervention.status ?? 500,
          )
        if (observation.intervention.kind === 'recovery')
          return this.fulfill(
            route,
            fixture,
            recoveryEnabled
              ? fixture.body
              : Buffer.from('{"error":"Screen Explorer injected failure"}'),
            recoveryEnabled ? fixture.status : 500,
          )
        return this.fulfill(route, fixture)
      })
      await page.goto(request.targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })
      if (observation.intervention.kind === 'delay')
        await page.waitForTimeout(loadingCaptureDelayMs)
      else if (observation.intervention.kind === 'recovery') {
        const firstAction = observation.actions[0]
        if (!firstAction || firstAction.kind !== 'click')
          throw new Error('Recovery observation has no click action.')
        await page
          .locator(firstAction.selector)
          .waitFor({ state: 'visible', timeout: 10_000 })
        recoveryEnabled = true
        await page.locator(firstAction.selector).click({ timeout: 10_000 })
        await page.waitForTimeout(750)
      } else
        await page.waitForTimeout(
          observation.intervention.kind === 'failure' ? 3_000 : 500,
        )
      const image = await page.screenshot({ fullPage: true })
      const visibleText = await page.locator('body').innerText()
      return {
        viewport,
        screenshot: await this.artifacts.writeScreenshot(
          `${observation.id}-${viewport.id}`,
          image,
        ),
        visibleText: visibleText.slice(0, 12_000),
        domHash: ArtifactStore.sha256(visibleText),
      }
    } finally {
      await context.close()
    }
  }

  private async delayAndFulfill(
    route: Route,
    fixture: CapturedResponse,
    delayMs: number,
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    await this.fulfill(route, fixture)
  }

  private desktopViewport() {
    const desktop = viewportPresets.find(
      (viewport) => viewport.id === 'desktop',
    )!
    return { width: desktop.width, height: desktop.height }
  }

  private contextOptions(
    request: ExplorationRequest,
    viewport: { width: number; height: number },
  ) {
    return {
      viewport,
      serviceWorkers: 'block' as const,
      ...(request.sessionStatePath
        ? { storageState: request.sessionStatePath }
        : {}),
    }
  }

  private routeArtifacts(
    request: ExplorationRequest,
    discovered: string[],
    observations: Observation[],
  ): RouteArtifact[] {
    const start = new URL(request.targetUrl)
    const known = new Set<string>([this.normalizedRoute(start)])
    const routes: RouteArtifact[] = [
      {
        id: 'route_0',
        label: this.routeLabel(start),
        url: this.normalizedRoute(start),
        source: 'start',
        coverage: { status: 'captured' },
        observations,
      },
    ]
    for (const href of [...discovered, ...(request.routeSeeds ?? [])]) {
      let candidate: URL
      try {
        candidate = new URL(href)
      } catch {
        continue
      }
      if (
        candidate.origin !== start.origin ||
        !['http:', 'https:'].includes(candidate.protocol)
      )
        continue
      const url = this.normalizedRoute(candidate)
      if (known.has(url)) continue
      known.add(url)
      const source = request.routeSeeds?.includes(href) ? 'seed' : 'link'
      routes.push({
        id: `route_${routes.length}`,
        label: this.routeLabel(candidate),
        url,
        source,
        coverage: {
          status: source === 'seed' ? 'seeded' : 'discovered',
          reason:
            source === 'seed'
              ? 'Explicit hidden-route seed. Select a route-specific read-only GET response before capturing its state sequence.'
              : 'Discovered from the rendered application. Select a route-specific read-only GET response before capturing its state sequence.',
        },
        observations: [],
      })
      if (routes.length >= 24) break
    }
    return routes
  }

  private normalizedRoute(url: URL): string {
    const normalized = new URL(url)
    normalized.hash = ''
    normalized.search = ''
    return normalized.toString()
  }

  private routeLabel(url: URL): string {
    return url.pathname === '/' ? '/' : url.pathname
  }

  private unsupported(
    id: ObservationKind,
    label: string,
    reason: string,
  ): Observation {
    return {
      id,
      label,
      condition: reason,
      capturedAt: new Date().toISOString(),
      intervention: this.interventionFor(id),
      actions: [],
      replay: { status: 'unsupported', attempts: 0, reason },
    }
  }

  private matches(
    url: string,
    method: string,
    request: ExplorationRequest,
  ): boolean {
    return (
      method === request.request.method &&
      url.includes(request.request.urlIncludes)
    )
  }

  private matchesCapturedResponse(
    url: string,
    method: string,
    fixture: CapturedResponse,
  ): boolean {
    return method === fixture.method && url === fixture.url
  }

  private async fulfill(
    route: Route,
    fixture: CapturedResponse,
    body = fixture.body,
    status = fixture.status,
  ): Promise<void> {
    await route.fulfill({ status, contentType: fixture.contentType, body })
  }

  private async toCapturedResponse(
    url: string,
    method: string,
    status: number,
    contentType: string,
    body: Buffer,
  ): Promise<CapturedResponse> {
    if (method !== 'GET')
      throw new Error(
        `Only GET response capture is supported, received ${method}`,
      )
    if (!contentType.includes('application/json'))
      throw new Error(
        `Matched response is not JSON (${contentType || 'no content type'})`,
      )
    return { url, method, status, contentType, body }
  }

  private interventionFor(id: ObservationKind) {
    if (id === 'loading')
      return { kind: 'delay' as const, delayMs: artificialDelayMs }
    if (id === 'empty') return { kind: 'empty-collection' as const }
    if (id === 'failed') return { kind: 'failure' as const, status: 500 }
    if (id === 'recovered') return { kind: 'recovery' as const }
    return { kind: 'baseline' as const }
  }
}
