import { resolve } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { PlaywrightReplayer } from './infrastructure/playwright-replayer.js'
import { viewportPresets, type RunArtifact } from './domain/contracts.js'

// Verify an existing, private artifact; never create a target app or publish evidence.
const directory = process.argv[2]
if (!directory)
  throw new Error(
    'Usage: npm run demo:verify -- .screen-explorer/runs/<state-run>',
  )
const runDirectory = resolve(directory)
const run = JSON.parse(
  await readFile(resolve(runDirectory, 'run.json'), 'utf8'),
) as RunArtifact
const expected = ['baseline', 'loading', 'empty', 'failed', 'recovered']
if (
  run.schemaVersion !== 5 ||
  expected.some(
    (id) =>
      !run.observations.some(
        (observation) =>
          observation.id === id && observation.previews?.length === 4,
      ),
  )
)
  throw new Error(
    'Demo gate requires all five states at all four viewport sizes.',
  )
const results = []
for (const observation of run.observations) {
  for (const viewport of viewportPresets) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const replay = await new PlaywrightReplayer().open(
        run,
        runDirectory,
        observation.id,
        true,
        viewport,
      )
      try {
        results.push({
          state: observation.id,
          viewport: viewport.id,
          attempt,
          ...replay.verification,
        })
        console.log(
          `${observation.id} / ${viewport.id} / ${attempt}: ${replay.verification.status}`,
        )
      } finally {
        await replay.browser.close()
      }
    }
  }
}
await writeFile(
  resolve(runDirectory, 'demo-verification.json'),
  JSON.stringify({ verifiedAt: new Date().toISOString(), results }, null, 2),
)
if (results.some((result) => result.status !== 'matched')) process.exitCode = 1
