// Validate in a transaction first. --apply commits the reviewed cache migration.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const { createRequire } = require('node:module')
const { randomUUID } = require('node:crypto')
const r = createRequire(path.resolve(__dirname, '../Frontend_GZV/package.json'))
createRequire(r.resolve('next/package.json'))('@next/env').loadEnvConfig(path.resolve(__dirname, '../Backend_GZV'))
const { Client } = r('pg')
const caPath = process.argv[process.argv.indexOf('--ca') + 1]
let client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000,
  ...(process.argv.includes('--ca') ? { ssl: { ca: fs.readFileSync(caPath, 'utf8'), rejectUnauthorized: true } } : {}) })
if (process.argv.includes('--local')) {
  if (process.argv.includes('--apply')) throw new Error('--local validates the migration without committing it')
  const { PGlite } = createRequire(path.join(require('node:os').tmpdir(), 'gzv-cv-sql-check', 'package.json'))('@electric-sql/pglite')
  const local = new PGlite()
  client = { connect: async () => {
    await local.exec(`
      create role anon; create role authenticated;
      create table public.authors(id uuid primary key,full_name text,slug text);
      create table public.gzver_departments(id uuid primary key,name text);
      create table public.gzvers(id uuid primary key,full_name text,slug text unique,is_active boolean,linked_author_id uuid references public.authors(id),department_id uuid references public.gzver_departments(id),department_name text,updated_at timestamptz default now(),cv_settings jsonb default '{}'::jsonb);
      create table public.projects(id uuid primary key,title text,slug text,status text,description text,detailproject text,image text,thumbnail_url text,gallery text[],category text,tech_stack text[],hashtags text,external_url text,demo_url text,video_url text,order_index int,author_ids uuid[],updated_at timestamptz default now(),image_position_x int,image_position_y int,image_scale int);
      create table public.gzver_project_highlights(id uuid primary key default gen_random_uuid(),gzver_id uuid references public.gzvers(id) on delete cascade,project_id uuid references public.projects(id) on delete cascade,contribution text default '',image_urls jsonb default '[]'::jsonb,is_visible boolean default true,sort_order int default 0,unique(gzver_id,project_id));
    `)
  }, query: async (sql, parameters) => parameters ? local.query(sql, parameters) : (await local.exec(sql)).at(-1) || { rows: [] }, end: () => local.close() }
}
const migration = fs.readFileSync(path.resolve(__dirname, '../sql/20261002120000_gzver_cv_snapshots.sql'), 'utf8').replace(/^begin;\s*/i, '').replace(/commit;\s*$/i, '')

;(async () => {
  await client.connect()
  await client.query('begin')
  await client.query(migration)
  await client.query('savepoint cv_regression')
  const profile = randomUUID(), author = randomUUID(), project = randomUUID()
  const slug = `cv-regression-${profile}`
  await client.query('insert into public.authors(id,full_name,slug) values($1,$2,$3)', [author, 'CV regression fixture', `fixture-${author}`])
  await client.query('insert into public.gzvers(id,full_name,slug,is_active,linked_author_id) values($1,$2,$3,true,$4)', [profile, 'CV regression fixture', slug, author])
  await client.query("insert into public.projects(id,title,slug,status,description,detailproject,gallery,author_ids) values($1,'CV project fixture',$2,'ongoing','Full description','<p>Full project detail</p>',array['/fixture-image.webp'],array[$3::uuid])", [project, `fixture-${project}`, author])
  const read = async () => (await client.query('select * from public.gzver_cv_snapshots where profile_id=$1', [profile])).rows[0]
  let row = await read()
  assert.equal(row.payload.projects.length, 1, 'Linked author assignments belong in the CV')
  assert.equal(row.payload.projects[0].detailproject, '<p>Full project detail</p>')
  assert.equal(row.payload.projects[0].gallery.length, 1)
  await client.query('update public.projects set author_ids=array[]::uuid[] where id=$1', [project])
  assert.equal((await read()).payload.projects.length, 0, 'Removing an assignment invalidates the snapshot')
  await client.query("insert into public.gzver_project_highlights(gzver_id,project_id,contribution,image_urls) values($1,$2,'Fixture contribution','[\"/extra-image.webp\"]'::jsonb)", [profile, project])
  row = await read()
  assert.equal(row.payload.projects[0].contribution, 'Fixture contribution')
  assert.equal(row.payload.projects[0].description, 'Full description')
  assert.equal(row.payload.projects[0].image_urls.length, 1)
  await client.query('savepoint cv_bulk_regression')
  await client.query('create temporary table cv_fixture_events(profile_id uuid) on commit drop')
  await client.query("create function gzv_private.cv_fixture_audit() returns trigger language plpgsql as $$begin insert into pg_temp.cv_fixture_events values(new.profile_id); return new; end$$")
  await client.query('create trigger cv_fixture_audit after update on public.gzver_cv_snapshots for each row execute function gzv_private.cv_fixture_audit()')
  const extra1 = randomUUID(), extra2 = randomUUID()
  await client.query("insert into public.projects(id,title,slug,status) values($1,'Bulk fixture 1',$3,'ongoing'),($2,'Bulk fixture 2',$4,'ongoing')", [extra1, extra2, `bulk-${extra1}`, `bulk-${extra2}`])
  await client.query('truncate pg_temp.cv_fixture_events')
  await client.query('insert into public.gzver_project_highlights(gzver_id,project_id) values($1,$2),($1,$3)', [profile, extra1, extra2])
  const bulk = await client.query('select count(*)::int as total from pg_temp.cv_fixture_events where profile_id=$1', [profile])
  assert.equal(bulk.rows[0].total, 1, 'A bulk highlight save compiles the profile only once')
  assert.equal((await read()).payload.projects.length, 3)
  await client.query('rollback to savepoint cv_bulk_regression')
  await client.query("update public.projects set title='Updated fixture project' where id=$1", [project])
  assert.equal((await read()).payload.projects[0].title, 'Updated fixture project', 'Project edits refresh their CVs')
  await client.query('update public.gzver_project_highlights set is_visible=false where gzver_id=$1', [profile])
  assert.equal((await read()).payload.projects.length, 0)
  await client.query('update public.gzvers set is_active=false where id=$1', [profile])
  row = await read()
  assert.equal(row.is_active, false)
  assert.equal(row.payload.person, null, 'Inactive snapshots carry no profile data')
  await client.query('update public.gzvers set is_active=true where id=$1', [profile])
  assert.ok((await read()).payload.person)
  await client.query('delete from public.gzvers where id=$1', [profile])
  assert.equal((await read()).payload.person, null, 'Deletion emits a persistent withdrawal tombstone')
  await client.query('rollback to savepoint cv_regression')
  await client.query('set local role anon')
  const visible = await client.query('select count(*)::int as total from public.gzver_cv_snapshots')
  await client.query('reset role')
  const coverage = await client.query('select (select count(*) from public.gzvers where is_active) = (select count(*) from public.gzver_cv_snapshots where is_active) as complete')
  assert.ok(coverage.rows[0].complete)
  await client.query(process.argv.includes('--apply') ? 'commit' : 'rollback')
  console.log(`PASS: assignments, full project data, one rebuild per bulk save, edits, visibility, withdrawal, public read permissions, active-profile coverage (${visible.rows[0].total} cached rows). Migration ${process.argv.includes('--apply') ? 'applied' : 'validated and rolled back'}.`)
})().catch(async (error) => {
  await client.query('rollback').catch(() => {})
  console.error(`CV database check failed: ${error.code || error.name}: ${error.message}`)
  process.exitCode = 1
}).finally(() => client.end())
