const path = require('node:path')
const { spawnSync } = require('node:child_process')
const root = path.resolve(__dirname, '..')
function run(args, cwd = root) {
  const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status || 1)
}
for (const app of ['Frontend_GZV', 'Backend_GZV']) {
  const cwd = path.join(root, app)
  console.log(`Checking ${app}`)
  // next build already runs both checks; do not repeat them in the full CI run.
  if (process.argv.includes('--checks-only')) {
    run(['--max-old-space-size=2048', 'node_modules/typescript/bin/tsc', '--noEmit'], cwd)
    run(['node_modules/next/dist/bin/next', 'lint', '--no-cache'], cwd)
  }
  if (!process.argv.includes('--checks-only')) run(['node_modules/next/dist/bin/next', 'build'], cwd)
}
if (!process.argv.includes('--build-only')) {
  for (const script of ['test-gzver-cv.cjs', 'test-gzver-cache.cjs', 'test-cms-security.cjs', 'test-cms-transactions.cjs']) run([path.join(__dirname, script)])
}
