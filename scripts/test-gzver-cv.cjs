// Run with: node scripts/test-gzver-cv.cjs
// Verify draft rendering and single-page sizing without requiring a browser.
const assert = require('node:assert/strict')
const { createRequire } = require('node:module')
const { load, appRequire } = require('./load-cv-module.cjs')
const React = appRequire('react')
const { renderToStaticMarkup } = appRequire('react-dom/server')
const { jsPDF } = createRequire(appRequire.resolve('html2pdf.js'))('jspdf')
const { CvDocument, downloadCvPdf } = load('shared/gzver/CvDocument.tsx')
const { CV_TEMPLATES, mergeCvProjects, cvText, projectImages } = load('shared/gzver/cv-model.ts')

const person = { full_name: 'Quách Thành Long', slug: 'quach-thanh-long', email: 'draft@example.com', skills: ['Lãnh đạo'], background: { experience: 'Kinh nghiệm đang biên tập' }, cv_settings: { show_contact: false, show_projects: false, template: 'midnight' } }
const projects = [{ id: 'p1', title: 'Dự án GZV', contribution: 'Vai trò đang biên tập', description: 'Mô tả mặc định', detailproject: '<p>Toàn bộ nội dung chi tiết</p><img src="/project-rich.webp">', image: '/project-cover.webp', gallery: ['/project-gallery.webp'], image_urls: ['/project-extra.webp'], tech_stack: ['React', 'Supabase'], slug: 'du-an-gzv' }]
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
assert.ok(visible.includes('Mô tả mặc định'), 'Contribution must not replace the project description')
for (const template of CV_TEMPLATES) {
  const output = render({ ...person, cv_settings: { template: template.id } })
  for (const text of ['Quách Thành Long', 'Toàn bộ nội dung chi tiết', 'Vai trò đang biên tập', '/project-cover.webp', '/project-gallery.webp', '/project-rich.webp', '/project-extra.webp', 'React', '/du-an/du-an-gzv']) assert.ok(output.includes(text), `${template.id} must preserve ${text}`)
}
assert.equal(projectImages(projects[0]).length, 4)
assert.equal(cvText('<script>alert(1)</script><p>A &amp; B</p>'), 'A & B')
assert.equal(mergeCvProjects({ id: 'g1', linked_author_id: 'a1' }, [{ id: 'p1', author_ids: ['a1'] }], []).length, 1)
assert.equal(mergeCvProjects({ id: 'g1' }, [{ id: 'p1', author_ids: ['g1'] }], [{ project_id: 'p1', is_visible: false }]).length, 0)

async function verifyExport(height, failImage = false) {
  let removed = false
  let renders = 0
  let downloads = 0
  let loaderCalls = 0
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
    createElement: (tag) => tag === 'a' ? { click() { downloads++ }, remove() {}, set download(value) { assert.equal(value, 'CV-quach-thanh-long.pdf') } } : { style: {}, appendChild() {}, remove() { removed = true } },
  }
  const factory = () => ({
    set(options) { latestOptions = options; return this },
    from() { return this }, toCanvas() { return this },
    get: async () => { canvas.width = 1588; canvas.height = height * 2; return canvas },
    outputPdf: async () => {
      const pdf = new jsPDF(latestOptions.jsPDF)
      const width = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      // Same rounding used by html2pdf: ensure the entire canvas fits one page.
      assert.equal(Math.ceil(canvas.height / Math.floor(canvas.width * pageHeight / width)), 1)
      assert.equal(pdf.getNumberOfPages(), 1)
      assert.ok(Math.abs(width - 210) < 0.001)
      assert.ok(pageHeight >= height * 210 / 794)
      renders++
      return new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' })
    },
  })
  const element = { outerHTML: `fixture-${height}-${failImage}`, cloneNode: () => clone }
  const action = () => downloadCvPdf(element, person.slug, async () => { loaderCalls++; return factory })
  if (failImage) await assert.rejects(action, /Không tải được ảnh/)
  else {
    await action(); await action()
    assert.equal(renders, 1, 'Unchanged CV downloads must reuse the completed PDF')
    assert.equal(loaderCalls, 1)
    assert.equal(downloads, 2)
    element.outerHTML += '-new-template'
    await action()
    assert.equal(renders, 2, 'Changing the template invalidates the PDF')
  }
  if (failImage) assert.equal(renders, 0)
  assert.ok(removed, 'Temporary export DOM must be removed on success and failure')
  assert.equal(clone.style.width, '794px')
}

;(async () => {
  for (const height of [1123, 3000, 10000]) await verifyExport(height)
  await verifyExport(1123, true)
  delete global.document
  console.log('PASS: all 6 designs preserve full data/images, linked-author assignments, visibility, rich-text safety, one-page sizing, PDF reuse/invalidation and failure cleanup.')
})().catch((error) => { console.error(error); process.exitCode = 1 })
