const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const r = createRequire(path.resolve(__dirname, '../Frontend_GZV/package.json'))
const { PGlite } = r('@electric-sql/pglite')
const { randomUUID } = require('node:crypto')
;(async () => {
  const db = new PGlite()
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth;
      create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      create function auth.role() returns text language sql as $$select nullif(current_setting('request.jwt.claim.role',true),'')$$;
      grant usage on schema auth to anon,authenticated;
      create table profiles(id uuid primary key,role text);
      create table authors(id uuid primary key,full_name text,sort_order integer);
      create table partners(id uuid primary key,name text);
      create table media_files(id uuid primary key,file_name text);
      create schema storage;
      create table storage.objects(id uuid primary key,bucket_id text,name text);
      alter table storage.objects enable row level security;
      create policy legacy_storage on storage.objects for all using(true) with check(true);
      grant usage on schema storage to anon,authenticated;
      grant select,insert,update,delete on storage.objects to anon,authenticated;
      create table gzvers(id uuid primary key default gen_random_uuid(),full_name text not null,slug text unique,updated_at timestamptz default now());
      create table projects(id uuid primary key);
      create table gzver_project_highlights(gzver_id uuid references gzvers(id),project_id uuid references projects(id),contribution text,image_urls jsonb,is_visible boolean,sort_order integer,updated_at timestamptz,unique(gzver_id,project_id));
      grant select,insert,update,delete on all tables in schema public to anon,authenticated;
      alter table profiles enable row level security;
      create policy legacy_profiles on profiles for all using(true) with check(true);
      create policy legacy_authors on authors for all using(true) with check(true);
      create policy legacy_partners on partners for all using(true) with check(true);
      create policy legacy_gzvers on gzvers for all using(true) with check(true);
      create policy legacy_highlights on gzver_project_highlights for all using(true) with check(true);
    `)
    const migration = fs.readFileSync(path.resolve(__dirname, '../sql/20261003090000_cms_write_guards_and_transactions.sql'), 'utf8')
    await db.exec(migration)
    await db.exec(migration) // Idempotency matters for manual rollouts.
    const admin = randomUUID(), user = randomUUID(), a = randomUUID(), b = randomUUID(), g = randomUUID(), project = randomUUID()
    await db.query("insert into profiles values ($1,'admin'),($2,'user')", [admin,user])
    await db.query("insert into authors values ($1,'A',10),($2,'B',20)", [a,b])
    await db.query("insert into gzvers(id,full_name,slug) values($1,'Before','before')",[g])
    await db.query('insert into projects values($1)',[project])
    await db.exec('set role anon')
    await db.query("select set_config('request.jwt.claim.role','anon',false)")
    assert.equal((await db.query('select * from authors')).rows.length,2)
    await assert.rejects(db.query("insert into authors values($1,'Intruder',0)",[randomUUID()]), /row-level security/)
    await assert.rejects(db.query("insert into storage.objects values($1,'media','intruder.webp')",[randomUUID()]), /row-level security/)
    await assert.rejects(db.query("insert into profiles values($1,'admin')",[randomUUID()]), /administrators|row-level security/)
    await db.exec('reset role; set role authenticated')
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user])
    assert.equal((await db.query('delete from profiles where id=$1 returning id',[admin])).rows.length,0)
    assert.equal((await db.query("update profiles set id=$1 where id=$2 returning id",[randomUUID(),admin])).rows.length,0)
    await assert.rejects(db.query("update profiles set role='admin' where id=$1",[user]), /administrators/)
    await assert.rejects(db.query('select reorder_authors($1)',[JSON.stringify([{id:a,sort_order:20}])]), /Forbidden/)
    assert.equal((await db.query("update authors set sort_order=9 where id=$1 returning id",[a])).rows.length,0)
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[admin])
    await db.query('select reorder_authors($1)',[JSON.stringify([{id:a,sort_order:20},{id:b,sort_order:10}])])
    assert.equal((await db.query('select id from authors order by sort_order')).rows[0].id,b)
    await assert.rejects(db.query('select reorder_authors($1)',[JSON.stringify([{id:a,sort_order:99},{id:randomUUID(),sort_order:1}])]), /missing/)
    assert.equal((await db.query('select sort_order from authors where id=$1',[a])).rows[0].sort_order,20)
    const version = (await db.query('select updated_at::text as v from gzvers where id=$1',[g])).rows[0].v
    await assert.rejects(db.query('select save_gzver_profile($1,$2,$3,$4)',[g,JSON.stringify({full_name:'Must rollback'}),JSON.stringify([{project_id:randomUUID()}]),version]), /foreign key/)
    assert.equal((await db.query('select full_name from gzvers where id=$1',[g])).rows[0].full_name,'Before')
    await db.query('select save_gzver_profile($1,$2,$3,$4)',[g,JSON.stringify({full_name:'After'}),JSON.stringify([{project_id:project,contribution:'Work',image_urls:['/image.webp']}]),version])
    assert.equal((await db.query('select contribution from gzver_project_highlights where gzver_id=$1',[g])).rows[0].contribution,'Work')
    await assert.rejects(db.query('select save_gzver_profile($1,$2,$3,$4)',[g,'{"full_name":"Stale"}','[]',version]), e => e.code === 'PT409')
    await assert.rejects(db.query('select save_gzver_profile(null,$1,$2)', ['{"full_name":"Invalid","unexpected":"field"}','[]']), /Unknown/)
    const created = (await db.query('select save_gzver_profile(null,$1,$2) as result',['{"full_name":"New","slug":"new"}','[]'])).rows[0].result
    assert.ok(created.id)
    console.log('PASS: migration idempotency, public reads, write guards despite legacy policies, role escalation denied, atomic reorder/profile rollback, stale edit protection and new profile creation')
  } finally { await db.close() }
})().catch(e => { console.error(e); process.exitCode=1 })
