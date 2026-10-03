const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const r = createRequire(path.resolve(__dirname,'../Frontend_GZV/package.json'))
createRequire(r.resolve('next/package.json'))('@next/env').loadEnvConfig(path.resolve(__dirname,'../Backend_GZV'))
const {Client}=r('pg')
;(async()=>{
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  const client=new Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000})
  try {
    await client.connect()
    await client.query('begin')
    const staff=await client.query("select count(*)::integer as count from public.profiles where role in ('admin','editor','collab')")
    if(!staff.rows[0].count && process.argv.includes('--apply')) throw new Error('No CMS staff profile. Resolve staff roles before tightening policies; no changes applied.')
    if(!staff.rows[0].count) console.log('No CMS staff profile: validation only. Apply is blocked until staff roles are resolved.')
    const sql=fs.readFileSync(path.resolve(__dirname,'../sql/20261003090000_cms_write_guards_and_transactions.sql'),'utf8').replace(/^begin;\s*/i,'').replace(/commit;\s*$/i,'')
    await client.query(sql)
    await client.query(process.argv.includes('--apply')?'commit':'rollback')
    console.log(process.argv.includes('--apply')?'CMS guards and transactions applied.':
      staff.rows[0].count?'CMS migration validated against database and rolled back. Use --apply to commit.':
        'CMS migration validated against database and rolled back. Rollout awaits an identified CMS staff account.')
  } catch(error) {
    try{await client.query('rollback')}catch{}
    // Do not print connection strings, credentials or server detail.
    console.error('CMS migration not applied:',error.code || error.message)
    process.exitCode=1
  } finally {await client.end()}
})().catch(error=>{console.error(error.message);process.exitCode=1})
