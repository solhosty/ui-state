/** Framework-neutral URL/template matching; parameters are never invented. */
export function routePattern(template: string): RegExp {
  const parts = template.split('/').filter(Boolean).map(part => {
    if (/^(\*|\[\[?\.\.\.|:.*\*)/.test(part)) return '.*'
    if (/^(:|\[|\$|\{)/.test(part)) return '[^/]+'
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })
  return new RegExp('^/' + parts.join('/') + '/?$')
}
export function isDynamic(template: string): boolean {
  return template.split('/').some(part => /^(:|\[|\$|\{|\*)/.test(part))
}
export function candidateUrl(value: string, base: string): string | undefined {
  try {
    const url = new URL(value, base)
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== new URL(base).origin || url.username || url.password) return
    if (/\.(png|jpe?g|gif|svg|webp|pdf|zip|css|js|map|ico|woff2?)$/i.test(url.pathname)) return
    if (/(^|\/)(logout|signout|sign-out|delete|remove)(\/|$)/i.test(url.pathname)) return
    if (!url.hash.startsWith('#/')) url.hash = ''
    return url.href
  } catch { return }
}

/** Resolve a template only from an observed URL sharing its literal prefix. */
export function resolveTemplate(template: string, observed: string): string | undefined {
  const expected = template.split('/').filter(Boolean)
  const actual = new URL(observed).pathname.split('/').filter(Boolean)
  if (!isDynamic(template) || !expected.length) return
  const resolved: string[] = []
  let parameters = 0
  for (let i = 0; i < expected.length; i++) {
    const part = expected[i]!
    if (isDynamic('/' + part)) {
      if (!actual[i] || /\.\.\.|\*/.test(part)) return
      resolved.push(actual[i]!); parameters++
    } else {
      if (actual[i] && actual[i] !== part) return
      resolved.push(part)
    }
  }
  return parameters ? '/' + resolved.join('/') : undefined
}
