import { spawn } from 'node:child_process'
import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

let server, rebuilding = false, queued = false, fingerprint = '', checking = false
const build = () => new Promise(resolve => {
  const child = spawn(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], { stdio: 'inherit' })
  child.on('error', error => { console.error(error); resolve(false) })
  child.on('exit', code => resolve(code === 0))
})
async function rebuild() {
  if (rebuilding) { queued = true; return }
  rebuilding = true
  try {
    if (await build()) {
      if (server && server.exitCode === null) {
        const previous = server
        const exited = new Promise(resolve => previous.once('exit', resolve))
        previous.kill('SIGTERM')
        await exited
      }
      server = spawn(process.execPath, ['dist/cli.js', 'dashboard'], { stdio: 'inherit', env: { ...process.env, SCREEN_EXPLORER_DEV: '1' } })
      server.on('error', error => console.error(error))
    }
  } finally { rebuilding = false; if (queued) { queued = false; void rebuild() } }
}
async function scan() {
  if (checking) return
  checking = true
  try {
    const files = (await readdir('src', { recursive: true })).filter(file => file.endsWith('.ts')).sort()
    const next = (await Promise.all(files.map(async file => { const info = await stat(join('src', file)); return `${file}:${info.mtimeMs}:${info.size}` }))).join('\n')
    if (next !== fingerprint) { fingerprint = next; await rebuild() }
  } catch (error) { console.error(error) }
  finally { checking = false }
}
// Polling survives atomic editor saves and filesystem bridges across OSes.
const timer = setInterval(() => void scan(), 500)
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { clearInterval(timer); server?.kill('SIGTERM'); process.exit() })
await scan()
