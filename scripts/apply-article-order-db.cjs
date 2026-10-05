const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')

const r = createRequire(path.resolve(__dirname, '../Frontend_GZV/package.json'))
createRequire(r.resolve('next/package.json'))('@next/env').loadEnvConfig(path.resolve(__dirname, '../Backend_GZV'))
const { Client } = r('pg')

;(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  const apply = process.argv.includes('--apply')
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
  try {
    await client.connect()
    const staff = await client.query("select count(*)::integer as count from public.profiles where role in ('admin','editor','collab')")
    if (!staff.rows[0].count) throw new Error('No CMS staff profile; migration was not applied.')
    const sql = fs.readFileSync(
      path.resolve(__dirname, '../sql/20261005100000_articles_order_and_publish_date.sql'),
      'utf8'
    ).replace(/^begin;\s*/i, '').replace(/commit;\s*$/i, '')
    await client.query('begin')
    await client.query(sql)
    const result = await client.query(`
      select
        exists(select 1 from information_schema.columns where table_schema='public' and table_name='articles' and column_name='sort_order') as has_order,
        to_regprocedure('public.reorder_articles(jsonb)') is not null as has_rpc
    `)
    if (!result.rows[0].has_order || !result.rows[0].has_rpc) throw new Error('Article ordering migration validation failed')
    await client.query(apply ? 'commit' : 'rollback')
    console.log(apply ? 'Article ordering migration applied.' : 'Article ordering migration validated and rolled back.')
  } catch (error) {
    try { await client.query('rollback') } catch {}
    throw error
  } finally {
    await client.end()
  }
})().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
