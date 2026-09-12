import type { LibraryObservation } from './library.js'

/** Presentation must not splice a recovery story together from unrelated runs. */
export function revealSequence(
  observations: LibraryObservation[],
): LibraryObservation[] {
  const baseline = observations.find(
    (item) =>
      item.id === 'baseline' && (item.screenshot || item.previews?.length),
  )
  if (!baseline) return []
  const sameRun = observations.filter(
    (item) =>
      item.evidenceRunId === baseline.evidenceRunId &&
      (item.screenshot || item.previews?.length),
  )
  const failure = sameRun.find((item) => item.id === 'failed')
  return ['baseline', 'loading', 'empty', 'failed', 'recovered'].flatMap(
    (id) => {
      const item = sameRun.find((candidate) => candidate.id === id)
      if (
        !item ||
        (id === 'recovered' &&
          (!failure || !item.actions.some((action) => action.kind === 'click')))
      )
        return []
      return [item]
    },
  )
}
