// Run with: node scripts/test-gzver-cv.cjs
// Verify draft rendering and single-page sizing without requiring a browser.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { createRequire } = require('node:module')
const appRequire = createRequire(path.resolve(__dirname, '../Frontend_GZV/package.json'))
const ts = appRequire('typescript')
const React = appRequire('react')
const { renderToStaticMarkup } = appRequire('react-dom/server')
const { jsPDF } = createRequire(appRequire.resolve('html2pdf.js'))('jspdf')
const source = fs.readFileSync(path.resolve(__dirname, '../shared/gzver/CvDocument.tsx'), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText
const exportsObject = {}
new Function('require', 'exports', compiled)(appRequire, exportsObject)
const { CvDocument, downloadCvPdf } = exportsObject

const person = { full_name: 'Quách Thành Long', slug: 'quach-thanh-long', email: 'draft@example.com', skills: ['Lãnh đạo'], background: { experience: 'Kinh nghiệm đang biên tập' }, cv_settings: { show_contact: false, show_projects: false, template: 'midnight' } }
const projects = [{ id: 'p1', title: 'Dự án GZV', contribution: 'Vai trò đang biên tập', description: 'Mô tả mặc định' }]
const render = (profile) => renderToStaticMarkup(React.createElement(CvDocument, { person: profile, projects }))
const hidden = render(person)
assert.ok(hidden.includes('Quách Thành Long'))
assert.ok(hidden.includes('/logo.webp'))
assert.ok(hidden.includes('Kinh nghiệm đang biên tập'))
assert.ok(!hidden.includes('draft@example.com'))
assert.ok(!hidden.includes('Dự án GZV'))
const visible = render({ ...person, cv_settings: {} })
assert.ok(visible.includes('draft@example.com'))
assert.ok(visible.includes('Vai trò đang biên tập'))
assert.ok(!visible.includes('Mô tả mặc định'))

async function verifyExport(height, failImage = false) {
  let removed = false
  let saved = false
  let latestOptions
  const canvas = { width: 1588, height: height * 2 }
  const clone = {
    style: {}, classList: { add() {} },
    getBoundingClientRect: () => ({ height }),
    querySelectorAll: () => [{ decode: () => failImage ? Promise.reject(new Error('broken image')) : Promise.resolve() }],
  }
  global.document = {
    fonts: { ready: Promise.resolve() },
    body: { appendChild() {} },
    createElement: () => ({ style: {}, appendChild() {}, remove() { removed = true } }),
  }
  const factory = () => ({
    set(options) { latestOptions = options; return this },
    from() { return this }, toCanvas() { return this },
    get: async () => canvas,
    save: async () => {
      assert.equal(latestOptions.filename, 'CV-quach-thanh-long.pdf')
      const pdf = new jsPDF(latestOptions.jsPDF)
      const width = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      // Same rounding used by html2pdf: ensure the entire canvas fits one page.
      assert.equal(Math.ceil(canvas.height / Math.floor(canvas.width * pageHeight / width)), 1)
      assert.equal(pdf.getNumberOfPages(), 1)
      assert.ok(Math.abs(width - 210) < 0.001)
      assert.ok(pageHeight >= height * 210 / 794)
      saved = true
    },
  })
  const action = () => downloadCvPdf({ cloneNode: () => clone }, person.slug, async () => factory)
  if (failImage) await assert.rejects(action, /Không tải được ảnh/)
  else await action()
  assert.equal(saved, !failImage)
  assert.ok(removed, 'Temporary export DOM must be removed on success and failure')
  assert.equal(clone.style.width, '794px')
}

;(async () => {
  for (const height of [1123, 3000, 10000]) await verifyExport(height)
  await verifyExport(1123, true)
  delete global.document
  console.log('PASS: draft content, contact/project visibility, contributions, single-page PDF sizing for short/long CVs, export cleanup on image failure.')
})().catch((error) => { console.error(error); process.exitCode = 1 })
