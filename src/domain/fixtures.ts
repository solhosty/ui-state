export function emptyFirstCollection(source: Buffer): Buffer | undefined {
  const payload: unknown = JSON.parse(source.toString('utf8'))
  const replaced = replaceFirstCollection(payload)
  return replaced ? Buffer.from(JSON.stringify(payload)) : undefined
}

function replaceFirstCollection(value: unknown): boolean {
  if (Array.isArray(value)) {
    value.splice(0, value.length)
    return true
  }
  if (value === null || typeof value !== 'object') return false
  for (const child of Object.values(value)) {
    if (replaceFirstCollection(child)) return true
  }
  return false
}
