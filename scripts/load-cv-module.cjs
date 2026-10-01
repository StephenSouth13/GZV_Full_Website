const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const appRequire = createRequire(path.resolve(__dirname, '../Frontend_GZV/package.json'))
const ts = appRequire('typescript')
const loaded = new Map()
function load(relativePath, overrides = {}) {
  const filename = path.resolve(__dirname, '..', relativePath)
  if (loaded.has(filename)) return loaded.get(filename)
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText
  const exports = {}
  loaded.set(filename, exports)
  const requireModule = (name) => {
    if (name in overrides) return overrides[name]
    if (name.startsWith('.')) return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), name + '.ts')), overrides)
    return appRequire(name)
  }
  // Revoke test URLs immediately instead of keeping the Node process alive for 30 seconds.
  new Function('require', 'exports', 'setTimeout', code)(requireModule, exports, (callback) => { callback(); return 0 })
  return exports
}
module.exports = { load, appRequire }
