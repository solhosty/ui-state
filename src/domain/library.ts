import type { DiscoveryRun, Observation, RouteArtifact, RunArtifact } from './contracts.js'
export type SavedRun = RunArtifact | DiscoveryRun
export type LibraryObservation = Observation & { evidenceRunId: string; replayRunId?: string }
export type LibraryRoute = Omit<RouteArtifact, 'observations'> & { observations: LibraryObservation[] }

/** Screenshots expand route coverage; they must never erase richer state evidence. */
export function buildLibrary(runs: SavedRun[], selected?: string) {
  const ordered = [...runs].sort((a,b) => b.startedAt.localeCompare(a.startedAt))
  const anchor = selected ? ordered.find(run => run.runId === selected) : (ordered.find(run => run.schemaVersion === 6) ?? ordered[0])
  if (!anchor) return undefined
  const sources = selected ? [anchor] : ordered.filter(run => run.target.origin === anchor.target.origin)
  const routes = new Map<string, LibraryRoute>()
  for (const run of sources) for (const route of run.routes) {
    if (!selected && run !== anchor && run.schemaVersion === 6 && ['stopped','failed'].includes(run.status)) continue
    if (!selected && run.schemaVersion === 5 && !route.observations.length) continue
    let current = routes.get(route.url)
    if (!current) { current = { ...route, id: `route_${routes.size}`, observations: [] }; routes.set(route.url, current) }
    if (run !== anchor && ['unreachable','needs-auth'].includes(current.coverage.status) && run.schemaVersion === 6) continue
    for (const observation of route.observations) {
      const candidate: LibraryObservation = { ...observation, evidenceRunId: run.runId, ...(run.schemaVersion === 5 ? { replayRunId: run.runId } : {}) }
      const index = current.observations.findIndex(item => item.id === candidate.id)
      if (index === -1) current.observations.push(candidate)
      else if (!current.observations[index]!.replayRunId && candidate.replayRunId) current.observations[index] = candidate
    }

  }
  const libraryRoutes = [...routes.values()]
  return { ...anchor, schemaVersion: 7, routes: libraryRoutes,
    observations: libraryRoutes.flatMap(route => route.observations),
    sourceRoutes: 'sourceRoutes' in anchor ? anchor.sourceRoutes : [], notes: 'notes' in anchor ? anchor.notes : [],
    history: ordered.map(run => ({ runId: run.runId, startedAt: run.startedAt, target: run.target.url, kind: run.schemaVersion === 5 ? 'State experiments' : 'Page exploration', captures: run.observations.length })),
    progress: { captured: anchor.routes.filter(r => r.observations.length).length, discovered: anchor.routes.length, attention: anchor.routes.filter(r => ['unreachable','needs-auth'].includes(r.coverage.status)).length },
    selectedRunId: selected ?? null }
}
