import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createDashboardServer } from './server.js'

test('served library preserves states, selects history, and blocks session artifacts', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dashboard-test-'))
  const server = createDashboardServer(root)
  try {
    for (const [id, schemaVersion, states, startedAt] of [['run_old',5,['baseline','loading','empty','failed','recovered'],'2026-09-09'], ['run_new',6,['baseline'],'2026-09-10']] as const) {
      await mkdir(join(root,'runs',id),{recursive:true})
      const observations = states.map(id => ({id,replay:{status:'captured'}}))
      await writeFile(join(root,'runs',id,'run.json'),JSON.stringify({runId:id,schemaVersion,startedAt,status:'complete',target:{url:'http://example.test/',origin:'http://example.test'},routes:[{id:'root',url:'http://example.test/',observations,coverage:{status:'captured'}}],observations}))
    }
    await new Promise<void>((resolve,reject) => { server.once('error',reject);server.listen(0,'127.0.0.1',resolve) })
    const address = server.address(); if (!address || typeof address === 'string') throw new Error('No server address')
    const base = `http://127.0.0.1:${address.port}`
    const library = await fetch(base+'/api/library').then(r=>r.json())
    assert.equal(library.routes[0].observations.length,5)
    assert.equal(library.routes[0].observations[0].replayRunId,'run_old')
    assert.equal((await fetch(base+'/api/library?run=run_new').then(r=>r.json())).observations.length,1)
    assert.equal((await fetch(base+'/artifacts/sessions/private.json')).status,404)
    assert.equal((await fetch(base+'/api/replay?observation=baseline&run=../bad',{method:'POST'})).status,400)
    assert.equal((await fetch(base+'/api/explore',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://untrusted.test'},body:'{}'})).status,403)
    assert.equal((await fetch(base+'/api/explore',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetUrl:'file:///etc/passwd'})})).status,400)
  } finally { await new Promise<void>(resolve=>server.close(()=>resolve())); await rm(root,{recursive:true,force:true}) }
})
