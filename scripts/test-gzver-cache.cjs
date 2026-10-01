const assert = require('node:assert/strict')
const { load } = require('./load-cv-module.cjs')
const { RequestCache } = load('shared/data/request-cache.ts')
const storage = () => {
  const values = new Map()
  return { get length() { return values.size }, key: (index) => [...values.keys()][index] || null, getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }
}

;(async () => {
  let calls = 0
  const cache = new RequestCache(2)
  const values = await Promise.all(Array.from({ length: 40 }, () => cache.get('cv', async () => { calls++; return 'current' })))
  assert.equal(calls, 1, 'Concurrent readers must share a single API call')
  assert.ok(values.every((value) => value === 'current'))
  let resolveOld
  const old = cache.get('changing', () => new Promise((resolve) => { resolveOld = resolve }))
  await Promise.resolve()
  cache.invalidate('changing')
  await cache.get('changing', async () => 'fresh')
  resolveOld('stale'); await old
  assert.equal(cache.peek('changing'), 'fresh', 'An older response cannot resurrect invalidated data')
  const store = storage()
  const writer = new RequestCache(2, () => store)
  writer.put('settings:branding', 'old')
  const reader = new RequestCache(2, () => store)
  reader.invalidate('settings:')
  assert.equal(reader.peek('settings:branding'), undefined, 'Realtime invalidation also removes unhydrated persisted data')
  for (const key of ['a', 'b', 'c']) writer.put(key, key)
  assert.equal(store.length, 2, 'Persistent storage is bounded')
  assert.equal(writer.peek('a'), undefined)
  let attempts = 0
  for (let i = 0; i < 5; i++) await assert.rejects(() => cache.get('offline', async () => { attempts++; throw new Error('offline') }), /offline/)
  assert.equal(attempts, 1, 'Outages must not produce a retry storm')
  cache.invalidate('offline')
  assert.equal(await cache.get('offline', async () => 'recovered'), 'recovered')

  const savedFetch = global.fetch
  const savedWindow = global.window
  const oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const oldKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fixture.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'fixture-anon'
  global.window = { location: { origin: 'https://fixture.local' }, sessionStorage: storage() }
  let httpCalls = 0
  global.fetch = async () => new Response(JSON.stringify({ revision: ++httpCalls }), { headers: { 'content-type': 'application/json' } })
  try {
    const { cachedPublicFetch, invalidatePublicTable } = load('Frontend_GZV/lib/public-fetch-cache.ts')
    const url = 'https://fixture.supabase.co/rest/v1/site_branding_settings?select=*'
    const options = { headers: { Authorization: 'Bearer fixture-anon' } }
    const responses = await Promise.all(Array.from({ length: 25 }, () => cachedPublicFetch(url, options)))
    assert.equal(httpCalls, 1)
    for (const response of responses) assert.equal((await response.json()).revision, 1, 'Each caller gets an independently readable Response')
    invalidatePublicTable('site_branding_settings')
    assert.equal((await (await cachedPublicFetch(url, options)).json()).revision, 2)
    await cachedPublicFetch(url, { headers: { Authorization: 'Bearer authenticated-user' } })
    await cachedPublicFetch(url, { headers: { Authorization: 'Bearer authenticated-user' } })
    assert.equal(httpCalls, 4, 'Authenticated responses must never enter the public cache')
    await cachedPublicFetch('https://fixture.supabase.co/rest/v1/profiles?select=*', options)
    await cachedPublicFetch('https://fixture.supabase.co/rest/v1/profiles?select=*', options)
    assert.equal(httpCalls, 6, 'Private tables bypass public caching')
  } finally {
    global.fetch = savedFetch
    if (savedWindow === undefined) delete global.window; else global.window = savedWindow
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = oldKey
  }
  let fullReads = 0, versionReads = 0, removals = 0
  let live = { profile_id: 'g1', slug: 'fixture-live', is_active: true, updated_at: '2026-10-02T00:00:00Z', payload: { person: { id: 'g1', full_name: 'Initial' }, projects: [] } }
  let channel
  const supabase = {
    from: () => {
      let projection
      const query = { select: (value) => { projection = value; return query }, eq: () => query, maybeSingle: async () => {
        if (projection === 'updated_at,is_active,slug') { versionReads++; return { data: { updated_at: live.updated_at, is_active: live.is_active, slug: live.slug } } }
        fullReads++; return { data: live.is_active ? live : null }
      } }
      return query
    },
    channel: () => {
      const handlers = []
      channel = { handlers, on: (kind, filter, callback) => { handlers.push({ filter, callback }); return channel }, subscribe: (callback) => { queueMicrotask(() => callback?.('SUBSCRIBED')); return channel } }
      return channel
    },
    removeChannel: async () => { removals++ },
  }
  const { watchGzverCv } = load('Frontend_GZV/lib/gzver-cv-data.ts', { '@/lib/api-supabase': { supabase } })
  let received
  const stop = watchGzverCv('fixture-live', (snapshot) => { received = snapshot })
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(fullReads, 1)
  assert.equal(versionReads, 1)
  assert.equal(channel.handlers[0].filter.filter, 'profile_id=eq.g1')
  live = { ...live, updated_at: '2026-10-02T00:00:01Z', payload: { person: { id: 'g1', full_name: 'Realtime edit' }, projects: [{ id: 'p1', title: 'New project' }] } }
  channel.handlers[0].callback({ new: live })
  assert.equal(received.payload.person.full_name, 'Realtime edit')
  assert.equal(received.payload.projects.length, 1)
  assert.equal(fullReads, 1, 'Snapshot events update the CV without another API read')
  live = { ...live, is_active: false, payload: { person: null, projects: [] } }
  channel.handlers[0].callback({ new: live })
  assert.equal(received, null, 'Hiding a profile withdraws cached content immediately')
  stop()
  assert.equal(removals, 1, 'Unused profile subscriptions are released')
  console.log('PASS: 40 readers/1 request, stale-response races, persisted invalidation, bounded cache, outage backoff, authenticated/private-data isolation, realtime updates/withdrawal without refetch and subscription cleanup.')
})().catch((error) => { console.error(error); process.exitCode = 1 })
