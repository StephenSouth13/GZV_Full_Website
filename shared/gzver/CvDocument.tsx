// Shared by the public CV and the admin draft preview. Keep this renderer free of hooks.
export function CvDocument({ person, projects = [], assetOrigin = "", compact = false }: { person: any; projects?: any[]; assetOrigin?: string; compact?: boolean }) {
  const settings = person.cv_settings || {}
  const accent = /^#[0-9a-f]{6}$/i.test(settings.accent || "") ? settings.accent : "#ed1c24"
  const asset = (url: string) => url?.startsWith("/") ? `${assetOrigin}${url}` : url
  const skills = Array.isArray(person.skills) ? person.skills : []
  const achievements = Array.isArray(person.achievements_list) ? person.achievements_list : []
  const sections = [
    ["Kinh nghiệm", person.background?.experience],
    ["Học vấn", person.background?.education],
    ["Lộ trình phát triển", person.promotion_path],
    ["Tác động cộng đồng", person.social_impact],
  ].filter(([, text]) => text)
  const style = { color: "var(--cv-ink)", "--cv-accent": accent }
  return <article className={`gzv-cv gzv-cv-${settings.template || "executive"}${compact ? " gzv-cv-compact" : ""}`} style={style}>
    <div className="gzv-cv-brand"><img src={asset("/logo.webp")} alt="GZV" /><span>THE VOICE OF GENZERS</span><span className="gzv-cv-label">HỒ SƠ NĂNG LỰC</span></div>
    <header className="gzv-cv-header">
      <div className="gzv-cv-intro"><p className="gzv-cv-eyebrow">{person.department_name || "GZV · PEOPLE & IMPACT"}</p><h1>{person.full_name || "Họ và tên"}</h1><p className="gzv-cv-role">{[person.position, person.company].filter(Boolean).join(" · ") || "Thành viên GZV"}</p>{person.headline && <p className="gzv-cv-headline">{person.headline}</p>}</div>
      {person.avatar_url && <img className="gzv-cv-avatar" src={asset(person.avatar_url)} alt={person.full_name || "Ảnh hồ sơ"} />}
    </header>
    <div className="gzv-cv-columns">
      <aside className="gzv-cv-sidebar">
        {settings.show_contact !== false && [person.email, person.phone, person.website_url].some(Boolean) && <section><h2>Liên hệ</h2><div className="gzv-cv-contact">{person.email && <a href={`mailto:${person.email}`}><small>EMAIL</small>{person.email}</a>}{person.phone && <a href={`tel:${person.phone}`}><small>ĐIỆN THOẠI</small>{person.phone}</a>}{person.website_url && <span><small>WEBSITE</small>{person.website_url}</span>}</div></section>}
        {skills.length > 0 && <section><h2>Năng lực</h2><div className="gzv-cv-skills">{skills.map((skill: string, i: number) => <span key={i}>{skill}</span>)}</div></section>}
        {person.course_taken && <section><h2>Đào tạo</h2><p>{person.course_taken}</p></section>}
        {person.mentoring_content && <section><h2>Mentoring</h2><p>{person.mentoring_content}</p></section>}
      </aside>
      <div className="gzv-cv-main">
        {(person.achievement_summary || person.testimonial) && <section><h2>Tóm tắt hồ sơ</h2><p className="gzv-cv-summary">{person.achievement_summary || person.testimonial}</p></section>}
        {sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
        {achievements.length > 0 && <section><h2>Thành tựu nổi bật</h2><ul>{achievements.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></section>}
      </div>
    </div>
    {settings.show_projects !== false && projects.length > 0 && <section className="gzv-cv-projects"><h2>Dự án tiêu biểu</h2><div className="gzv-cv-project-grid">{projects.map((project) => <div className="gzv-cv-project" key={project.id}>{project.image && <img src={asset(project.image)} alt={project.title || "Dự án"} />}<div><h3>{project.title}</h3>{(project.contribution || project.excerpt || project.description) && <p>{project.contribution || project.excerpt || project.description}</p>}</div></div>)}</div></section>}
    <footer className="gzv-cv-footer"><span>GZV.ONE</span><span>THE VOICE OF GENZERS</span></footer>
    <style>{cvStyles}</style>
  </article>
}

export const cvStyles = `
.gzv-cv{--cv-ink:#172033;--cv-muted:#596579;--cv-panel:#f4f6f9;box-sizing:border-box;width:100%;max-width:794px;min-height:1123px;margin:0 auto;padding:42px 46px 28px;background:#fff;color:var(--cv-ink);font-family:Arial,Helvetica,sans-serif;box-shadow:0 20px 70px #17203318;text-align:left;line-height:1.65}
.gzv-cv *{box-sizing:border-box}.gzv-cv p,.gzv-cv h1,.gzv-cv h2,.gzv-cv h3{margin:0}.gzv-cv p,.gzv-cv li{white-space:pre-line;overflow-wrap:anywhere}.gzv-cv-brand{display:flex;align-items:center;gap:14px;padding-bottom:28px;font-size:8px;font-weight:700;letter-spacing:1.8px;color:var(--cv-muted)}.gzv-cv-brand img{width:72px;height:38px;object-fit:contain;background:#fff;padding:3px}.gzv-cv-label{margin-left:auto;letter-spacing:1.2px}.gzv-cv-header{display:flex;align-items:center;gap:28px;padding:0 0 30px;border-bottom:3px solid var(--cv-accent)}.gzv-cv-intro{flex:1;min-width:0}.gzv-cv-eyebrow{color:var(--cv-accent);font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase}.gzv-cv h1{margin:10px 0;font-size:34px;line-height:1.15;font-weight:800;letter-spacing:-1px;text-transform:uppercase;overflow-wrap:anywhere}.gzv-cv-role{font-size:12px;font-weight:700;color:var(--cv-muted)}.gzv-cv-headline{margin-top:10px!important;font-size:11px;color:var(--cv-muted)}.gzv-cv-avatar{width:116px;height:146px;object-fit:cover;object-position:center;border-radius:4px}.gzv-cv-columns{display:grid;grid-template-columns:190px minmax(0,1fr);gap:30px;padding-top:30px}.gzv-cv-sidebar{background:var(--cv-panel);padding:22px 18px;align-self:start;border-radius:4px}.gzv-cv section+section{margin-top:26px}.gzv-cv h2{font-size:10px;font-weight:800;letter-spacing:1.7px;text-transform:uppercase;color:var(--cv-accent);margin-bottom:12px}.gzv-cv p,.gzv-cv li{font-size:11px;color:var(--cv-muted);line-height:1.85}.gzv-cv .gzv-cv-summary{font-size:12px;color:var(--cv-ink);font-weight:500}.gzv-cv-contact{display:grid;gap:16px}.gzv-cv-contact a,.gzv-cv-contact>span{font-size:10px;color:var(--cv-ink);text-decoration:none;overflow-wrap:anywhere}.gzv-cv-contact small{display:block;font-size:7px;letter-spacing:1.4px;color:var(--cv-muted);margin-bottom:4px}.gzv-cv-skills{display:flex;flex-wrap:wrap;gap:7px}.gzv-cv-skills span{font-size:9px;font-weight:600;padding:5px 8px;background:#fff;color:#263044;border-radius:3px}.gzv-cv ul{padding-left:16px;margin:0}.gzv-cv li+li{margin-top:8px}.gzv-cv li::marker{color:var(--cv-accent)}.gzv-cv-projects{margin-top:30px}.gzv-cv-project-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.gzv-cv-project{background:var(--cv-panel);overflow:hidden;border-radius:4px}.gzv-cv-project>img{width:100%;height:140px;object-fit:cover}.gzv-cv-project>div{padding:14px}.gzv-cv h3{font-size:11px;font-weight:800;line-height:1.5;margin-bottom:7px}.gzv-cv-project p{font-size:10px}.gzv-cv-footer{display:flex;justify-content:space-between;gap:10px;margin-top:36px;padding-top:16px;border-top:1px solid #dce1e8;font-size:8px;font-weight:700;letter-spacing:2px;color:var(--cv-muted)}
.gzv-cv-midnight{--cv-ink:#f1f5f9;--cv-muted:#c3cddd;--cv-panel:#1b2435;background:#101827}.gzv-cv-minimal{--cv-panel:#fafafa;box-shadow:none;border-top:4px solid var(--cv-accent)}
.gzv-cv-compact:not(.gzv-cv-export){padding:26px 22px;min-height:0}.gzv-cv-compact:not(.gzv-cv-export) h1{font-size:26px}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-label{display:none}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-header{gap:16px}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-avatar{width:80px;height:108px}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-columns{grid-template-columns:1fr;gap:24px}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-project-grid{grid-template-columns:1fr}
/* html2canvas renders flex reliably; use explicit spacing for PDF capture. */
.gzv-cv-export .gzv-cv-columns{display:flex;gap:0}.gzv-cv-export .gzv-cv-sidebar{width:190px;flex-shrink:0;margin-right:30px}.gzv-cv-export .gzv-cv-main{flex:1;min-width:0}.gzv-cv-export .gzv-cv-project-grid{display:flex;flex-wrap:wrap;gap:0;margin:-8px}.gzv-cv-export .gzv-cv-project{width:calc(50% - 16px);margin:8px}.gzv-cv-export .gzv-cv-header{gap:0}.gzv-cv-export .gzv-cv-intro{margin-right:28px}.gzv-cv-export .gzv-cv-brand{gap:0}.gzv-cv-export .gzv-cv-brand img{margin-right:14px}.gzv-cv-export .gzv-cv-skills{gap:0}.gzv-cv-export .gzv-cv-skills span{margin:0 7px 7px 0}.gzv-cv-export .gzv-cv-contact{display:block}.gzv-cv-export .gzv-cv-contact>a,.gzv-cv-export .gzv-cv-contact>span{display:block;margin-bottom:16px}
@media(max-width:600px){.gzv-cv:not(.gzv-cv-export){padding:26px 22px;min-height:0}.gzv-cv:not(.gzv-cv-export) h1{font-size:26px}.gzv-cv:not(.gzv-cv-export) .gzv-cv-label{display:none}.gzv-cv:not(.gzv-cv-export) .gzv-cv-header{gap:16px}.gzv-cv:not(.gzv-cv-export) .gzv-cv-avatar{width:80px;height:108px}.gzv-cv:not(.gzv-cv-export) .gzv-cv-columns{grid-template-columns:1fr;gap:24px}.gzv-cv:not(.gzv-cv-export) .gzv-cv-project-grid{grid-template-columns:1fr}}
@media print{.gzv-cv{box-shadow:none;max-width:none;width:210mm;padding:12mm;print-color-adjust:exact;-webkit-print-color-adjust:exact}.gzv-cv section{break-inside:auto}.gzv-cv h2{break-after:avoid}.gzv-cv-project{break-inside:avoid}.gzv-cv-footer{position:static}}
`

// Capture at a fixed desktop width, then size one PDF page to the actual canvas.
// No CSS/legacy page-break rules and no forced A4 slicing.
export async function downloadCvPdf(element: HTMLElement, slug: string, loadPdf: () => Promise<any>) {
  const clone = element.cloneNode(true) as HTMLElement
  clone.classList.add("gzv-cv-export")
  clone.style.width = "794px"
  clone.style.maxWidth = "none"
  clone.style.margin = "0"
  const host = document.createElement("div")
  host.style.cssText = "position:absolute;left:-10000px;top:0;width:794px;pointer-events:none;"
  host.appendChild(clone)
  document.body.appendChild(host)
  try {
    await document.fonts.ready
    await Promise.all(Array.from(clone.querySelectorAll("img")).map(async (img) => {
      img.crossOrigin = "anonymous"
      await img.decode().catch(() => { throw new Error("Không tải được ảnh trong CV. Vui lòng kiểm tra ảnh và thử lại.") })
    }))
    const html2pdf = await loadPdf()
    const height = Math.ceil(clone.getBoundingClientRect().height)
    const scale = Math.min(2, 16000 / Math.max(794, height), Math.sqrt(24000000 / (794 * height)))
    const canvas: HTMLCanvasElement = await html2pdf().set({
      margin: 0, pagebreak: { mode: [] },
      html2canvas: { scale, useCORS: true, backgroundColor: null, logging: false, windowWidth: 1200, scrollX: 0, scrollY: 0 },
      jsPDF: { unit: "mm", format: [210, height * 210 / 794 + 1], orientation: "portrait" },
    }).from(clone).toCanvas().get("canvas")
    const pageHeight = canvas.height * 210 / canvas.width + 1
    if (pageHeight > 5000) throw new Error("CV quá dài để xuất thành một trang PDF. Vui lòng rút gọn nội dung.")
    await html2pdf().set({
      filename: `CV-${(slug || "GZVer").replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`,
      margin: 0, image: { type: "jpeg", quality: 0.98 },
      jsPDF: { unit: "mm", format: [210, pageHeight], orientation: "portrait", compress: true },
    }).from(canvas).save()
  } finally {
    host.remove()
  }
}
