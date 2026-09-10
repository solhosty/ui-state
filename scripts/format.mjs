import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import * as prettier from 'prettier'

const check = process.argv.includes('--check')
const options = { semi: false, singleQuote: true, trailingComma: 'all' }
const files = (await readdir('src', { recursive: true })).filter(file => file.endsWith('.ts')).map(file => join('src', file))
let failed = false
for (const file of files) {
  const original = await readFile(file, 'utf8')
  let source = original
  const marker = file.endsWith('enhancements.ts') ? 'String.raw`' : file.endsWith('styles.ts') ? '= `' : null
  if (marker) {
    const start = source.indexOf(marker) + marker.length
    const end = source.lastIndexOf('`')
    const embedded = await prettier.format(source.slice(start, end), { ...options, parser: file.endsWith('styles.ts') ? 'css' : 'babel' })
    source = source.slice(0, start) + '\n' + embedded + source.slice(end)
  }
  source = await prettier.format(source, { ...options, parser: 'typescript' })
  if (source !== original) {
    if (check) { console.error(`Needs formatting: ${file}`); failed = true }
    else await writeFile(file, source)
  }
}
if (failed) process.exitCode = 1
