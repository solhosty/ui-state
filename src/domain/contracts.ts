export type ObservationKind = 'baseline' | 'loading' | 'empty' | 'failed' | 'recovered'
export type ReplayStatus = 'captured' | 'matched' | 'unsupported' | 'failed'
export type ViewportId = 'mobile' | 'tablet' | 'desktop' | 'xl-desktop'

export interface ViewportPreset {
  id: ViewportId
  label: string
  width: number
  height: number
}

export const viewportPresets: readonly ViewportPreset[] = [
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
  { id: 'tablet', label: 'Tablet', width: 820, height: 1_180 },
  { id: 'desktop', label: 'Desktop', width: 1_440, height: 960 },
  { id: 'xl-desktop', label: 'XL desktop', width: 1_920, height: 1_080 },
]

export interface RequestMatcher {
  method: 'GET'
  urlIncludes: string
}

export interface ExplorationRequest {
  targetUrl: string
  request: RequestMatcher
  retrySelector?: string
  sessionStatePath?: string
  routeSeeds?: string[]
  autoRetry?: boolean
  headed: boolean
}

export interface AuthenticationContext {
  mode: 'none' | 'playwright-storage-state'
  sessionStatePath?: string
}

export interface CapturedResponse {
  url: string
  method: 'GET'
  status: number
  contentType: string
  body: Buffer
}

export interface ReplayResult {
  status: ReplayStatus
  attempts: number
  outcomeDomHash?: string
  reason?: string
}

export interface ReplayVerification {
  status: 'matched' | 'failed'
  expectedDomHash?: string
  actualDomHash: string
  reason?: string
}

export interface Intervention {
  kind: 'baseline' | 'delay' | 'empty-collection' | 'failure' | 'recovery'
  delayMs?: number
  status?: number
}

export interface RecordedAction {
  kind: 'click'
  selector: string
}

export interface ObservationPreview {
  viewport: ViewportPreset
  screenshot: string
  visibleText: string
  domHash: string
}

export interface RouteCoverage {
  status: 'captured' | 'discovered' | 'seeded' | 'unreachable' | 'queued' | 'capturing' | 'needs-auth'
  reason?: string
}

export interface RouteArtifact {
  id: string
  label: string
  url: string
  source: 'start' | 'link' | 'seed'
  coverage: RouteCoverage
  observations: Observation[]
}

export interface Observation {
  id: ObservationKind
  label: string
  condition: string
  screenshot?: string
  visibleText?: string
  domHash?: string
  previews?: ObservationPreview[]
  capturedAt: string
  intervention: Intervention
  actions: RecordedAction[]
  replay: ReplayResult
}

export interface RunArtifact {
  schemaVersion: 5
  runId: string
  target: { url: string; origin: string }
  request: { method: 'GET'; url: string; match: RequestMatcher; fixturePath: string; fixtureSha256: string }
  startedAt: string
  completedAt: string
  observations: Observation[]
  routes: RouteArtifact[]
  authentication: AuthenticationContext
  limits: {
    responseInterception: 'explicit-read-only-get'
    outgoingWrites: 'blocked'
    serviceWorkers: 'unsupported'
    realtime: 'unsupported'
  }
}

export interface SourceRoute {
  template: string
  source: string
  status: 'unresolved' | 'resolved'
  examples: string[]
}
export interface DiscoveryRequest {
  targetUrl: string
  sourceDirectory?: string
  maxPages?: number
}
export interface DiscoveryRun {
  schemaVersion: 6
  mode: 'screenshots'
  runId: string
  target: { url: string; origin: string }
  startedAt: string
  completedAt?: string
  status: 'running' | 'complete' | 'stopped' | 'failed'
  error?: string
  routes: RouteArtifact[]
  sourceRoutes: SourceRoute[]
  notes: string[]
  observations: Observation[]
}
