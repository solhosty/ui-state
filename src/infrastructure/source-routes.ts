import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { SourceRoute } from '../domain/contracts.js'

/** Conservative static hints. Runtime visits, not source guesses, establish coverage. */
export async function discoverSourceRoutes(root: string): Promise<{ routes: SourceRoute[]; notes: string[] }> {
  if (!(await stat(root)).isDirectory()) throw new Error('Source directory must be a folder.')
  let dependencies: Record<string, unknown> = {}
  try { const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')); dependencies = { ...pkg.dependencies, ...pkg.devDependencies } } catch {}
  const next = 'next' in dependencies, nuxt = 'nuxt' in dependencies, svelte = '@sveltejs/kit' in dependencies
  const routes: SourceRoute[] = [], notes: string[] = []
  const seen = new Set<string>()
  let files = 0
  const add = (template: string, source: string) => {
    if (!template.startsWith('/') || template.includes('://') || template.includes('${') || seen.has(template)) return
    seen.add(template); routes.push({ template, source, status: 'unresolved', examples: [] })
  }
  async function walk(dir: string): Promise<void> {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['node_modules','dist','build','vendor','coverage'].includes(entry.name)) continue
      const path = join(dir, entry.name)
      if (entry.isDirectory()) { await walk(path); continue }
      if (!entry.isFile() || !/\.(tsx?|jsx?|vue|svelte|py|rb|php)$/.test(entry.name)) continue
      if (++files > 20000) { if (!notes.length) notes.push('Source inspection reached 20,000 files; browser discovery continues.'); return }
      const source = relative(root, path).replaceAll('\\', '/')
      // Next app router and SvelteKit route directories.
      const app = source.match(/(?:^|\/)(?:app|routes)\/(.*?)(?:page\.(?:tsx?|jsx?)|\+page\.svelte)$/)
      if (app && ((next && /(?:^|\/)app\//.test(source)) || (svelte && /\+page\.svelte$/.test(source))) && !app[1]!.includes('@')) add('/' + app[1]!.split('/').filter(x => x && !/^\(.*\)$/.test(x)).join('/'), source)
      const pages = source.match(/(?:^|\/)pages\/(.*)\.(?:tsx?|jsx?|vue)$/)
      if ((next || nuxt) && pages && !/^(api\/|_)/.test(pages[1]!)) add('/' + pages[1]!.replace(/(?:^|\/)index$/, ''), source)
      if ((await stat(path)).size > 1_000_000) continue
      const text = await readFile(path, 'utf8')
      // Literal declarations used by common routers; relative/nested configs need runtime evidence.
      for (const match of text.matchAll(/\b(?:path|route)\s*(?:=|:)\s*["'`]([^"'`]+)["'`]/g)) add(match[1]!, source)
      for (const match of text.matchAll(/(?:\b(?:router|app)\.(?:get|route)|@(?:\w+\.)?(?:route|get)|\bget)\s*\(?\s*["'`](\/[^"'`]*)["'`]/g)) add(match[1]!, source)
    }
  }
  await walk(root)
  return { routes, notes }
}
