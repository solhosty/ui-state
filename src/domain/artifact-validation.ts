import { createHash, timingSafeEqual } from 'node:crypto'
import type { RunArtifact } from './contracts.js'

export function validateRunArtifact(run: RunArtifact): void {
  if (run.schemaVersion !== 5)
    throw new Error(`Unsupported artifact schema version: ${run.schemaVersion}`)
  if (
    run.authentication.mode === 'playwright-storage-state' &&
    !run.authentication.sessionStatePath
  )
    throw new Error(
      'Authenticated runs must record a local session-state path.',
    )
  if (run.request.method !== 'GET')
    throw new Error(`Unsafe recorded request method: ${run.request.method}`)
  if (run.request.match.method !== 'GET')
    throw new Error(
      `Unsafe recorded matcher method: ${run.request.match.method}`,
    )
  if (!run.request.match.urlIncludes.trim())
    throw new Error(
      'Recorded request matcher must include a non-empty URL fragment.',
    )
  const requestUrl = new URL(run.request.url)
  if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:')
    throw new Error('Recorded request URL must use HTTP(S).')
  if (!/^[a-f0-9]{64}$/i.test(run.request.fixtureSha256))
    throw new Error('Recorded fixture hash must be a SHA-256 hex digest.')
  if (!run.request.fixturePath.startsWith('fixtures/'))
    throw new Error(
      'Fixture path must remain inside the run fixture directory.',
    )
  if (run.observations.length === 0)
    throw new Error('A run artifact must contain at least one observation.')
  if (run.routes.length === 0)
    throw new Error('A run artifact must include at least its starting route.')
  for (const route of run.routes) {
    const routeUrl = new URL(route.url)
    if (routeUrl.origin !== run.target.origin)
      throw new Error('Discovered routes must remain on the target origin.')
    if (!route.label.trim()) throw new Error('Routes need a display label.')
    if (route.coverage.status === 'captured' && route.observations.length === 0)
      throw new Error('Captured routes need observations.')
  }
  for (const observation of run.observations) {
    for (const action of observation.actions) {
      if (action.kind !== 'click' || !action.selector.trim())
        throw new Error(
          'Recorded action must be a click with a non-empty selector.',
        )
    }
    if (
      observation.replay.status === 'captured' ||
      observation.replay.status === 'matched'
    ) {
      if (!observation.previews || observation.previews.length !== 4)
        throw new Error(
          'Replayable observations must include all four viewport previews.',
        )
      const ids = new Set(
        observation.previews.map((preview) => preview.viewport.id),
      )
      if (
        ids.size !== 4 ||
        !['mobile', 'tablet', 'desktop', 'xl-desktop'].every((id) =>
          ids.has(id as never),
        )
      )
        throw new Error(
          'Viewport previews must cover mobile, tablet, desktop, and XL desktop.',
        )
      for (const preview of observation.previews) {
        if (
          !preview.screenshot.startsWith('screenshots/') ||
          !preview.visibleText ||
          !/^[a-f0-9]{64}$/i.test(preview.domHash)
        )
          throw new Error('Viewport preview evidence is malformed.')
      }
    }
  }
}

export function fixtureHashMatches(expected: string, body: Buffer): boolean {
  const actual = Buffer.from(expected, 'hex')
  const calculated = Buffer.from(
    createHash('sha256').update(body).digest('hex'),
    'hex',
  )
  return (
    actual.length === calculated.length && timingSafeEqual(actual, calculated)
  )
}
