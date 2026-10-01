# GZVer CV and public-data caching

The admin draft preview and public CV use the same document renderer and six templates: Executive, Essential, Midnight, Editorial, Studio and Portfolio. Template changes do not read or write Supabase. Saving in admin persists the chosen design; a visitor's design selection only changes that visitor's preview/download.

Every template includes the same available profile information, project description, personal contribution, complete project detail, cover/gallery images, technologies, links and credentials. Explicit visibility settings apply consistently. Linked author assignments and explicit project selections are combined without truncating the project list. Image paths are normalized without additional API calls, and image galleries preserve their aspect ratio.

Continuous PDF downloads reuse a completed blob until the document markup/revision changes. The cache holds at most six PDFs and 48 MiB. Native A4 printing is available in both admin and the public CV; it keeps text selectable and handles portfolios longer than the maximum length of a single PDF page. Print/export uses the desktop layout even when the admin previews a mobile layout.

## Data flow

`sql/20261002120000_gzver_cv_snapshots.sql` adds a read-only public snapshot table. Private database functions compile a profile and its public projects when source records change. Statement-level triggers rebuild each affected profile once per batch; unrelated profiles are untouched. Project associations have GIN and reverse-lookup indexes. Snapshot writes are limited to database triggers, and the exposed project fields are explicitly selected.

Inactive/deleted profiles leave empty tombstones so an open CV can withdraw content immediately. The migration registers relevant tables with the existing Supabase realtime publication. Profile and CV routes share a bounded 60-second session cache, deduplicate concurrent requests, and subscribe to one profile's snapshot. An UPDATE supplies the new payload directly, without rereading profiles/projects. A small version-only read after subscription/reconnection covers updates missed during disconnection. Hidden tabs release profile subscriptions.

Before the migration is installed, the same pages use filtered, paginated legacy queries, relevant realtime events and a 60-second compatibility refresh. The migration is required for database materialization and the query-free snapshot update path.

Public CMS configuration has a five-minute bounded session cache. Header, footer, SEO, floating actions and shell share a realtime channel. Events invalidate only the changed table and debounce readers; hidden tabs invalidate data without launching refresh queries. Account/private queries and authenticated responses bypass this public cache. Request failures have a short retry cooldown, and old responses cannot overwrite invalidated entries.

Admin project/author catalogs cache selected fields in memory for five minutes, scoped to the signed-in user. Realtime changes invalidate catalogs. Highlights have a one-minute cache and invalidate after save. Remote catalog refreshes preserve unsaved selections. Admin data is not persisted to browser storage.

## Validation and rollout

Run the document and cache regression checks:

```powershell
node scripts/test-gzver-cv.cjs
node scripts/test-gzver-cache.cjs
```

The database check validates the migration inside a transaction, tests temporary fixtures and rolls them back. It covers linked assignments, complete project data, bulk-write coalescing, source edits, visibility and withdrawal.

```powershell
# DATABASE_URL in Backend_GZV/.env must reach this same Supabase project's database.
node scripts/check-gzver-cv-db.cjs
# Commit the validated schema/cache changes; temporary regression fixtures still roll back.
node scripts/check-gzver-cv-db.cjs --apply
# A supplied database CA can be used via --ca <certificate-path>.
```

For an isolated PostgreSQL test without connecting to production:

```powershell
npm install --prefix "$env:TEMP/gzv-cv-sql-check" --no-audit --no-fund @electric-sql/pglite
node scripts/check-gzver-cv-db.cjs --local
```

Run TypeScript and `next build` independently in each app. Do not run a typecheck while a build is rewriting that app's `.next/types` directory.

The source SQL is idempotent and does not replace user profile/project records. The snapshot migration must be applied before claiming production database materialization is enabled. Browser/PDF visual verification should be performed on the actual saved profile, all six designs, mobile and desktop.

References: [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes), [database functions](https://supabase.com/docs/guides/database/functions), [database connections](https://supabase.com/docs/guides/database/connecting-to-postgres).
