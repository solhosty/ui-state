import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium, type Browser, type Route } from 'playwright'
import type { CapturedResponse, Observation, ReplayVerification, RunArtifact } from '../domain/contracts.js'
import { emptyFirstCollection } from '../domain/fixtures.js'
import { fixtureHashMatches, validateRunArtifact } from '../domain/artifact-validation.js'

const chromeExecutable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

export class PlaywrightReplayer {
  async open(run: RunArtifact, runDirectory: string, observationId: string, headless = false): Promise<{ browser: Browser; verification: ReplayVerification }> {
    validateRunArtifact(run)
    const observation = run.observations.find(candidate => candidate.id === observationId)
    if (!observation) throw new Error(`Unknown observation: ${observationId}`)
    if (observation.replay.status === 'unsupported' || observation.replay.status === 'failed') throw new Error(`This observation cannot be replayed: ${observation.replay.reason ?? observation.condition}`)
    const fixture = await this.readFixture(join(runDirectory, run.request.fixturePath))
    if (!fixtureHashMatches(run.request.fixtureSha256, fixture.body)) throw new Error('Recorded fixture does not match its artifact hash.')
    const browser = await chromium.launch({ headless, ...(existsSync(chromeExecutable) ? { executablePath: chromeExecutable } : {}) })
    try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, serviceWorkers: 'block', ...(run.authentication.mode === 'playwright-storage-state' ? { storageState: run.authentication.sessionStatePath! } : {}) })
    const page = await context.newPage()
    // A framework may duplicate its initial request in development. Recovery is
    // driven by the recorded action, not by an incidental request count.
    let recoveryEnabled = false
    await page.route('**/*', route => {
      if (!['GET','HEAD','OPTIONS'].includes(route.request().method())) return route.abort()
      if (!this.matches(route, run)) return route.continue()
      return this.fulfill(route, fixture, observation, recoveryEnabled)
    })
    await page.goto(run.target.url, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    if (observation.intervention.kind === 'delay') await page.waitForTimeout(250)
    else if (observation.intervention.kind === 'recovery') {
      if (observation.actions.length === 0) throw new Error('Recovery observation has no recorded action.')
      const firstAction = observation.actions[0]!
      if (firstAction.kind === 'click') await page.locator(firstAction.selector).waitFor({ state: 'visible', timeout: 10_000 })
      recoveryEnabled = true
      for (const action of observation.actions) {
        if (action.kind === 'click') await page.locator(action.selector).click({ timeout: 10_000 })
      }
      await page.waitForTimeout(750)
    } else await page.waitForTimeout(observation.intervention.kind === 'failure' ? 3_000 : 500)
    const visibleText = await page.locator('body').innerText()
    const actualDomHash = createHash('sha256').update(visibleText).digest('hex')
    const expectedDomHash = observation.domHash
    const verification: ReplayVerification = expectedDomHash === actualDomHash
      ? { status: 'matched', expectedDomHash, actualDomHash }
      : { status: 'failed', ...(expectedDomHash ? { expectedDomHash } : {}), actualDomHash, reason: expectedDomHash ? 'Replay DOM text differs from the captured observation.' : 'The observation has no captured DOM hash.' }
    return { browser, verification }
    } catch (error) { await browser.close(); throw error }
  }

  private matches(route: Route, run: RunArtifact): boolean {
    return route.request().method() === run.request.method && route.request().url() === run.request.url
  }

  private async fulfill(route: Route, fixture: CapturedResponse, observation: Observation, recoveryEnabled = false): Promise<void> {
    if (observation.intervention.kind === 'delay') {
      await new Promise(resolve => setTimeout(resolve, observation.intervention.delayMs ?? 1_500))
      return route.fulfill({ status: fixture.status, contentType: fixture.contentType, body: fixture.body })
    }
    if (observation.intervention.kind === 'empty-collection') {
      const body = emptyFirstCollection(fixture.body)
      if (!body) throw new Error('Recorded fixture has no collection to empty.')
      return route.fulfill({ status: fixture.status, contentType: fixture.contentType, body })
    }
    if (observation.intervention.kind === 'failure') return route.fulfill({ status: observation.intervention.status ?? 500, contentType: fixture.contentType, body: Buffer.from('{"error":"Screen Explorer injected failure"}') })
    if (observation.intervention.kind === 'recovery') {
      if (!recoveryEnabled) {
        return route.fulfill({ status: 500, contentType: fixture.contentType, body: Buffer.from('{"error":"Screen Explorer injected failure"}') })
      }
    }
    return route.fulfill({ status: fixture.status, contentType: fixture.contentType, body: fixture.body })
  }

  private async readFixture(path: string): Promise<CapturedResponse> {
    const raw = JSON.parse(await readFile(path, 'utf8')) as { status: number; contentType: string; body: string }
    return { url: '', method: 'GET', status: raw.status, contentType: raw.contentType, body: Buffer.from(raw.body, 'base64') }
  }
}
