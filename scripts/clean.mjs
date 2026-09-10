import { rm } from 'node:fs/promises'
// Generated output only. Private evidence lives in .screen-explorer, never dist.
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true })
