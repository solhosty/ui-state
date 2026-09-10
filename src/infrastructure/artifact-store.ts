import { createHash } from 'node:crypto'
import { mkdir, writeFile, rename } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { RunArtifact, DiscoveryRun } from '../domain/contracts.js'

export class ArtifactStore {
  readonly runDirectory: string

  constructor(
    private readonly rootDirectory: string,
    readonly runId: string,
    private readonly publishLatest = true,
  ) {
    this.runDirectory = join(rootDirectory, 'runs', runId)
  }

  async writeScreenshot(name: string, image: Buffer): Promise<string> {
    const relativePath = `screenshots/${name}.png`
    const destination = join(this.runDirectory, relativePath)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, image)
    return relativePath
  }

  async writeRun(run: RunArtifact | DiscoveryRun): Promise<void> {
    await mkdir(this.runDirectory, { recursive: true })
    const payload = `${JSON.stringify(run, null, 2)}\n`
    await writeFile(join(this.runDirectory, 'run.json.tmp'), payload)
    await rename(
      join(this.runDirectory, 'run.json.tmp'),
      join(this.runDirectory, 'run.json'),
    )
    if (!this.publishLatest) return
    await mkdir(this.rootDirectory, { recursive: true })
    await writeFile(join(this.rootDirectory, 'latest-run.json.tmp'), payload)
    await rename(
      join(this.rootDirectory, 'latest-run.json.tmp'),
      join(this.rootDirectory, 'latest-run.json'),
    )
  }

  async writeFixture(response: {
    status: number
    contentType: string
    body: Buffer
  }): Promise<string> {
    const relativePath = 'fixtures/response.json'
    const destination = join(this.runDirectory, relativePath)
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(
      destination,
      `${JSON.stringify({ status: response.status, contentType: response.contentType, body: response.body.toString('base64') }, null, 2)}\n`,
    )
    return relativePath
  }

  static sha256(value: Buffer | string): string {
    return createHash('sha256').update(value).digest('hex')
  }
}
