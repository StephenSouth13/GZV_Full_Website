const fs = require("fs")
const path = require("path")
const { createClient } = require(path.resolve(__dirname, "../Backend_GZV/node_modules/@supabase/supabase-js"))
const { Client } = require(path.resolve(__dirname, "../Backend_GZV/node_modules/pg"))

const envPath = path.resolve(__dirname, "../Backend_GZV/.env")
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8").split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=")
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")]
    }),
)

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

async function main() {
  if (process.argv.includes("--validate") || process.argv.includes("--apply")) {
    const database = new Client({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 10000 })
    await database.connect()
    try {
      await database.query("begin")
      await database.query(fs.readFileSync(path.resolve(__dirname, "../sql/20261013110000_gzver_positions.sql"), "utf8"))
      const result = await database.query("select count(*)::int as count from public.gzver_positions")
      if (process.argv.includes("--apply")) await database.query("commit")
      else await database.query("rollback")
      console.log(`PASS: migration ${process.argv.includes("--apply") ? "applied" : "validated and rolled back"}; ${result.rows[0].count} positions found.`)
    } catch (error) {
      await database.query("rollback").catch(() => {})
      throw error
    } finally {
      await database.end()
    }
  }

  const { data, error, count } = await client.from("gzver_positions").select("id,name,is_active,sort_order", { count: "exact" }).limit(3)
  console.log(JSON.stringify({ table_exists: !error, count, error: error && { code: error.code, message: error.message }, sample: data }, null, 2))
  if (error) process.exitCode = 1
}

main().catch((error) => { console.error(`${error.code || error.name}: ${error.message}`); process.exitCode = 1 })
