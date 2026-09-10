import { readdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { join } from 'node:path'
const files = (await readdir('dist', { recursive: true })).filter(file => file.endsWith('.test.js')).map(file => join('dist', file))
if (!files.length) throw new Error('No compiled tests found. Run npm run build first.')
const child = spawn(process.execPath, ['--test', ...files], { stdio: 'inherit' })
child.on('error', error => { console.error(error); process.exitCode = 1 })
child.on('exit', code => { process.exitCode = code ?? 1 })
