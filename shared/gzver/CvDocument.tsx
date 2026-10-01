import { cvContrastInk, cvList, cvReadableAccent, cvText, normalizeTemplate, projectImages, safeCvImage, safeCvLink } from "./cv-model"

// One semantic document and the same complete data for every design and PDF.
export function CvDocument({ person, projects = [], assetOrigin = "", compact = false }: { person: any; projects?: any[]; assetOrigin?: string; compact?: boolean }) {
  const settings = person.cv_settings || {}
  const accent = /^#[0-9a-f]{6}$/i.test(settings.accent || "") ? settings.accent : "#ed1c24"
  const template = normalizeTemplate(settings.template)
  const asset = (url: unknown) => { const safe = safeCvImage(url); return safe.startsWith("/") ? `${assetOrigin}${safe}` : safe }
  const skills = cvList(person.skills).map(cvText).filter(Boolean)
  const achievements = cvList(person.achievements_list).map(cvText).filter(Boolean)
  const credentials = cvList(person.online_cards).filter((card) => card.visible !== false)
  const socialLinks: any[] = Array.isArray(person.social_links) ? person.social_links : Object.entries(person.social_links || {}).map(([label, href]) => ({ label, href }))
  const sections = [
    ["Kinh nghiệm", person.background?.experience],
    ["Vai trò trước đây", person.background?.previous_role],
    ["Học vấn", person.background?.education],
    ["Lộ trình phát triển", person.promotion_path],
    ["Tác động cộng đồng", person.social_impact],
  ].filter(([, text]) => cvText(text))
  const extraSections = cvList(person.profile_tabs).filter((section) => section.visible !== false && section.content && !sections.some(([, text]) => cvText(text) === cvText(section.content)))
  const style = { color: "var(--cv-ink)", "--cv-accent": accent, "--cv-accent-ink": cvReadableAccent(accent, template), "--cv-hero-ink": cvContrastInk(accent) }
  return <article className={`gzv-cv gzv-cv-${template}${compact ? " gzv-cv-compact" : ""}`} style={style} data-revision={[person.updated_at || "", ...projects.map((project) => project.updated_at || "")].join("|")}>
    <div className="gzv-cv-brand"><img src={asset("/logo.webp")} alt="GZV" /><span>THE VOICE OF GENZERS</span><span className="gzv-cv-label">HỒ SƠ NĂNG LỰC</span></div>
    {template === "portfolio" && asset(person.cover_image_url) && <figure className="gzv-cv-cover"><img src={asset(person.cover_image_url)} alt={`Ảnh bìa ${person.full_name || "hồ sơ"}`} /></figure>}
    <header className="gzv-cv-header">
      <div className="gzv-cv-intro"><p className="gzv-cv-eyebrow">{cvText(person.department_name) || "GZV · PEOPLE & IMPACT"}</p><h1>{cvText(person.full_name) || "Họ và tên"}</h1><p className="gzv-cv-role">{[person.position, person.company].map(cvText).filter(Boolean).join(" · ") || "Thành viên GZV"}</p>{person.headline && <p className="gzv-cv-headline">{cvText(person.headline)}</p>}{person.location && <p className="gzv-cv-location">{cvText(person.location)}</p>}</div>
      {asset(person.avatar_url) && <img className="gzv-cv-avatar" src={asset(person.avatar_url)} alt={person.full_name || "Ảnh hồ sơ"} style={{ objectPosition: `${person.avatar_position_x ?? 50}% ${person.avatar_position_y ?? 50}%` }} />}
    </header>
    <div className="gzv-cv-columns">
      <aside className="gzv-cv-sidebar">
        {settings.show_contact !== false && <section><h2>Liên hệ</h2><div className="gzv-cv-contact">{person.email && <a href={`mailto:${person.email}`}><small>EMAIL</small>{person.email}</a>}{person.phone && <a href={`tel:${person.phone}`}><small>ĐIỆN THOẠI</small>{person.phone}</a>}{safeCvLink(person.website_url) && <a href={safeCvLink(person.website_url)}><small>WEBSITE</small>{person.website_url}</a>}{socialLinks.filter((link) => link.visible !== false && safeCvLink(link.href || link.url)).map((link, i) => <a key={i} href={safeCvLink(link.href || link.url)}><small>{cvText(link.label || link.platform) || "SOCIAL"}</small>{link.href || link.url}</a>)}</div></section>}
        {skills.length > 0 && <section><h2>Năng lực</h2><div className="gzv-cv-skills">{skills.map((skill: string, i: number) => <span key={i}>{skill}</span>)}</div></section>}
        {person.course_taken && <section><h2>Đào tạo</h2><p>{cvText(person.course_taken)}</p></section>}
        {person.graduation_year && <section><h2>Khóa / Năm tốt nghiệp</h2><p>{cvText(person.graduation_year)}</p></section>}
        {person.mentoring_content && <section><h2>Mentoring & Coaching</h2><p>{cvText(person.mentoring_content)}</p></section>}
      </aside>
      <div className="gzv-cv-main">
        {person.achievement_summary && <section><h2>Tóm tắt hồ sơ</h2><p className="gzv-cv-summary">{cvText(person.achievement_summary)}</p></section>}
        {person.testimonial && person.testimonial !== person.achievement_summary && <blockquote className="gzv-cv-quote">{cvText(person.testimonial)}</blockquote>}
        {sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{cvText(text)}</p></section>)}
        {achievements.length > 0 && <section><h2>Thành tựu nổi bật</h2><ul>{achievements.map((item: string, i: number) => <li key={i}>{item}</li>)}</ul></section>}
        {extraSections.map((section, i) => <section key={section.key || i}><h2>{cvText(section.label)}</h2><p>{cvText(section.content)}</p>{cvList(section.items).length > 0 && <ul>{cvList(section.items).map((item, index) => <li key={index}>{cvText(item)}</li>)}</ul>}</section>)}
      </div>
    </div>
    {settings.show_projects !== false && projects.length > 0 && <section className="gzv-cv-projects"><div className="gzv-cv-section-heading"><div><p className="gzv-cv-eyebrow">SELECTED WORK / {String(projects.length).padStart(2, "0")}</p><h2>Dự án & kinh nghiệm thực tiễn</h2></div><span>GZV PORTFOLIO</span></div><div className={`gzv-cv-project-grid gzv-cv-${settings.project_layout || "grid-1"}`}>{projects.map((project, index) => {
      const images = projectImages(project)
      const description = cvText(project.description || project.excerpt)
      const details = cvText(project.detailproject || project.content)
      const contribution = cvText(project.contribution || project.profile_contribution)
      const tags = cvList(project.tech_stack || project.technologies).map(cvText).filter(Boolean)
      const href = safeCvLink(project.external_url || project.demo_url) || (project.slug ? `${assetOrigin}/du-an/${encodeURIComponent(project.slug)}` : "")
      const status = ({ completed: "Hoàn thành", ongoing: "Đang triển khai", "in-progress": "Đang triển khai", planning: "Lên kế hoạch", "on-hold": "Tạm dừng", cancelled: "Đã hủy" } as Record<string, string>)[project.status] || cvText(project.status)
      return <div className="gzv-cv-project" key={project.id || index}>
        <div className="gzv-cv-project-topline"><span>PROJECT {String(index + 1).padStart(2, "0")}</span><span>{cvText(project.category)}</span></div>
        {images[0] && <figure className="gzv-cv-project-cover"><img src={asset(images[0].src)} alt={images[0].caption || project.title || "Dự án"} />{images[0].caption && <figcaption>{images[0].caption}</figcaption>}</figure>}
        <div className="gzv-cv-project-body"><h3>{cvText(project.title)}</h3><div className="gzv-cv-project-meta">{status && <span>{status}</span>}{project.client_name && <span>{cvText(project.client_name)}</span>}{(project.start_date || project.end_date) && <span>{[project.start_date, project.end_date].filter(Boolean).join(" → ")}</span>}</div>
          {description && <p>{description}</p>}{contribution && <div className="gzv-cv-contribution"><h4>Vai trò & đóng góp</h4><p>{contribution}</p></div>}
          {settings.show_project_details !== false && details && details !== description && <div className="gzv-cv-project-details"><h4>Thông tin dự án</h4><p>{details}</p></div>}
          {tags.length > 0 && <div className="gzv-cv-tags">{tags.map((tag, i) => <span key={i}>{tag}</span>)}</div>}{project.hashtags && <p className="gzv-cv-hashtags">{cvText(project.hashtags)}</p>}
          <div className="gzv-cv-project-links">{href && <a href={href}>Xem dự án ↗ <span>{href}</span></a>}{safeCvLink(project.video_url) && <a href={safeCvLink(project.video_url)}>Video dự án ↗ <span>{project.video_url}</span></a>}</div>
        </div>
        {settings.show_project_gallery !== false && images.length > 1 && <div className="gzv-cv-gallery">{images.slice(1).map((image, i) => <figure key={image.src}><img src={asset(image.src)} alt={image.caption || `${project.title} · Ảnh ${i + 2}`} />{image.caption && <figcaption>{image.caption}</figcaption>}</figure>)}</div>}
      </div>
    })}</div></section>}
    {settings.show_credentials !== false && credentials.length > 0 && <section className="gzv-cv-credentials"><h2>Chứng nhận & hồ sơ xác thực</h2><div className="gzv-cv-credential-grid">{credentials.map((card, i) => <div key={i} className="gzv-cv-credential"><h3>{cvText(card.title)}</h3><p>{[card.issuer, card.issued_at].map(cvText).filter(Boolean).join(" · ")}</p>{asset(card.front_image_url) && <img src={asset(card.front_image_url)} alt={`${card.title} · Mặt trước`} />}{asset(card.back_image_url) && <img src={asset(card.back_image_url)} alt={`${card.title} · Mặt sau`} />}{safeCvLink(card.verification_url) && <a href={safeCvLink(card.verification_url)}>Xác thực: {card.verification_url}</a>}</div>)}</div></section>}
    <footer className="gzv-cv-footer"><a href={person.slug ? `${assetOrigin}/gzver/${encodeURIComponent(person.slugexport const cvStyles = `
.gzv-cv{--cv-ink:#172033;--cv-muted:#596579;--cv-panel:#f4f6f9;box-sizing:border-box;width:100%;max-width:794px;min-height:1123px;margin:0 auto;padding:42px 46px 28px;background:#fff;color:var(--cv-ink);font-family:Arial,Helvetica,sans-serif;box-shadow:0 20px 70px #17203318;text-align:left;line-height:1.65}
.gzv-cv *{box-sizing:border-box}.gzv-cv p,.gzv-cv h1,.gzv-cv h2,.gzv-cv h3{margin:0}.gzv-cv p,.gzv-cv li{white-space:pre-line;overflow-wrap:anywhere}.gzv-cv-brand{display:flex;align-items:center;gap:14px;padding-bottom:28px;font-size:8px;font-weight:700;letter-spacing:1.8px;color:var(--cv-muted)}.gzv-cv-brand img{width:72px;height:38px;object-fit:contain;background:#fff;padding:3px}.gzv-cv-label{margin-left:auto;letter-spacing:1.2px}.gzv-cv-header{display:flex;align-items:center;gap:28px;padding:0 0 30px;border-bottom:3px solid var(--cv-accent)}.gzv-cv-intro{flex:1;min-width:0}.gzv-cv-eyebrow{color:var(--cv-accent);font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase}.gzv-cv h1{margin:10px 0;font-size:34px;line-height:1.15;font-weight:800;letter-spacing:-1px;text-transform:uppercase;overflow-wrap:anywhere}.gzv-cv-role{font-size:12px;font-weight:700;color:var(--cv-muted)}.gzv-cv-headline{margin-top:10px!important;font-size:11px;color:var(--cv-muted)}.gzv-cv-avatar{width:116px;height:146px;object-fit:cover;object-position:center;border-radius:4px}.gzv-cv-columns{display:grid;grid-template-columns:190px minmax(0,1fr);gap:30px;padding-top:30px}.gzv-cv-sidebar{background:var(--cv-panel);padding:22px 18px;align-self:start;border-radius:4px}.gzv-cv section+section{margin-top:26px}.gzv-cv h2{font-size:10px;font-weight:800;letter-spacing:1.7px;text-transform:uppercase;color:var(--cv-accent);margin-bottom:12px}.gzv-cv p,.gzv-cv li{font-size:11px;color:var(--cv-muted);line-height:1.85}.gzv-cv .gzv-cv-summary{font-size:12px;color:var(--cv-ink);font-weight:500}.gzv-cv-contact{display:grid;gap:16px}.gzv-cv-contact a,.gzv-cv-contact>span{font-size:10px;color:var(--cv-ink);text-decoration:none;overflow-wrap:anywhere}.gzv-cv-contact small{display:block;font-size:7px;letter-spacing:1.4px;color:var(--cv-muted);margin-bottom:4px}.gzv-cv-skills{display:flex;flex-wrap:wrap;gap:7px}.gzv-cv-skills span{font-size:9px;font-weight:600;padding:5px 8px;background:#fff;color:#263044;border-radius:3px}.gzv-cv ul{padding-left:16px;margin:0}.gzv-cv li+li{margin-top:8px}.gzv-cv li::marker{color:var(--cv-accent)}.gzv-cv-projects{margin-top:30px}
.gzv-cv-project{background:var(--cv-panel);overflow:hidden;border-radius:4px}.gzv-cv-project>img{width:100%;height:140px;object-fit:cover}.gzv-cv-project>div{padding:14px}.gzv-cv h3{font-size:11px;font-weight:800;line-height:1.5;margin-bottom:7px}.gzv-cv-project p{font-size:10px}.gzv-cv-footer{display:flex;justify-content:space-between;gap:10px;margin-top:36px;padding-top:16px;border-top:1px solid #dce1e8;font-size:8px;font-weight:700;letter-spacing:2px;color:var(--cv-muted)}
.gzv-cv-midnight{--cv-ink:#f1f5f9;--cv-muted:#c3cddd;--cv-panel:#1b2435;background:#101827}.gzv-cv-minimal{--cv-panel:#fafafa;box-shadow:none;border-top:4px solid var(--cv-accent)}
.gzv-cv-compact:not(.gzv-cv-export){padding:26px 22px;min-height:0}.gzv-cv-compact:not(.gzv-cv-export) h1{font-size:26px}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-label{display:none}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-header{gap:16px}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-avatar{width:80px;height:108px}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-columns{grid-template-columns:1fr;gap:24px}
/* Explicit flex spacing gives the browser and PDF renderer the same composition. */
.gzv-cv{--cv-line:#dde4e9;counter-reset:cv-section}.gzv-cv a{color:inherit;text-decoration:none;overflow-wrap:anywhere}.gzv-cv figure{margin:0}.gzv-cv img{max-width:100%}.gzv-cv-location{margin-top:8px!important;font-size:10px!important}.gzv-cv-cover img{display:block;width:100%;height:auto;margin-bottom:26px}.gzv-cv-columns{display:flex;gap:0}.gzv-cv-sidebar{width:190px;flex-shrink:0;margin-right:30px;align-self:flex-start}.gzv-cv-main{flex:1;min-width:0}.gzv-cv-contact{display:block}.gzv-cv-contact>a{display:block;margin-bottom:16px}.gzv-cv-skills{gap:0}.gzv-cv-skills span{margin:0 7px 7px 0}.gzv-cv-header{gap:0}.gzv-cv-intro{margin-right:28px}.gzv-cv-brand{gap:0}.gzv-cv-brand img{margin-right:14px}.gzv-cv-quote{margin:24px 0;padding-left:18px;border-left:2px solid var(--cv-accent);font-size:12px;line-height:1.85;font-style:italic;color:var(--cv-muted);white-space:pre-line}
.gzv-cv-projects,.gzv-cv-credentials{margin-top:38px!important}.gzv-cv-section-heading{display:flex;align-items:end;justify-content:space-between;padding:18px 0;border-top:1px solid var(--cv-line)}.gzv-cv-section-heading h2{font-size:17px;letter-spacing:-.3px;text-transform:none;margin:5px 0 0;color:var(--cv-ink)}.gzv-cv-section-heading>span{font-size:7px;letter-spacing:1.2px;color:var(--cv-muted)}.gzv-cv-project{background:var(--cv-panel);border-radius:5px;overflow:hidden}.gzv-cv-project:first-child{margin-top:4px!important}.gzv-cv-project-topline{display:flex;justify-content:space-between;padding:12px 18px;font-size:8px;letter-spacing:1.2px;color:var(--cv-muted);text-transform:uppercase}.gzv-cv-project-cover img{display:block;width:100%;height:auto}.gzv-cv figcaption{font-size:9px;line-height:1.6;padding:8px 12px;color:var(--cv-muted)}.gzv-cv .gzv-cv-project-body{padding:22px}.gzv-cv .gzv-cv-project h3{font-size:19px;font-weight:800;letter-spacing:-.4px;line-height:1.35;margin:0 0 10px}.gzv-cv-project-meta{display:flex;flex-wrap:wrap;margin-bottom:12px}.gzv-cv-project-meta>span{font-size:8px;padding:3px 8px;border:1px solid var(--cv-line);margin:0 7px 6px 0;color:var(--cv-muted)}.gzv-cv h4{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;color:var(--cv-accent)}.gzv-cv-contribution{padding-left:15px;border-left:2px solid var(--cv-accent);margin-top:18px}.gzv-cv-project-details{margin-top:20px}.gzv-cv-tags{display:flex;flex-wrap:wrap;margin-top:16px}.gzv-cv-tags span{font-size:8px;color:var(--cv-muted);padding:3px 7px;background:var(--cv-line);margin:0 5px 5px 0}.gzv-cv-hashtags{margin-top:12px!important;font-size:9px!important}.gzv-cv-project-links{margin-top:16px}.gzv-cv-project-links>a{display:block;font-size:9px;font-weight:700;color:var(--cv-accent);margin-top:8px}.gzv-cv-project-links a>span{display:block;font-size:8px;font-weight:400;color:var(--cv-muted)}.gzv-cv-gallery{display:flex;flex-wrap:wrap;padding:0 14px 14px}.gzv-cv-gallery figure{width:calc(50% - 12px);margin:6px;align-self:flex-start}.gzv-cv-gallery img{display:block;width:100%;height:auto;border-radius:3px}.gzv-cv-credential-grid{display:flex;flex-wrap:wrap;margin:0 -8px}.gzv-cv-credential{width:calc(50% - 16px);margin:8px;padding:16px;background:var(--cv-panel)}.gzv-cv-credential h3{font-size:12px}.gzv-cv-credential img{display:block;width:100%;height:auto;margin-top:12px}.gzv-cv-credential a{display:block;margin-top:12px;font-size:9px;color:var(--cv-accent)}
.gzv-cv-minimal{--cv-panel:#fafaf9;box-shadow:none;border:0}.gzv-cv-minimal .gzv-cv-header{border-bottom:1px solid var(--cv-line)}.gzv-cv-minimal h1{font-size:34px;letter-spacing:-.8px;text-transform:none}.gzv-cv-minimal .gzv-cv-columns{flex-direction:column}.gzv-cv-minimal .gzv-cv-main{width:100%;order:1}.gzv-cv-minimal .gzv-cv-sidebar{width:100%;order:2;margin:30px 0 0;padding:20px 0;background:none;border-top:1px solid var(--cv-line)}.gzv-cv-minimal .gzv-cv-contact{display:flex;flex-wrap:wrap}.gzv-cv-minimal .gzv-cv-contact>a{width:50%;padding-right:16px}.gzv-cv-minimal .gzv-cv-avatar{border-radius:50%;height:116px}.gzv-cv-minimal .gzv-cv-project{background:none;border:1px solid var(--cv-line)}
.gzv-cv-midnight{--cv-ink:#f2f5fb;--cv-muted:#c0cbdc;--cv-panel:#1c293b;--cv-line:#37465b;background:#101827}.gzv-cv-midnight .gzv-cv-header{padding:18px 0 36px;border-bottom:1px solid var(--cv-line)}.gzv-cv-midnight h1{font-size:42px;letter-spacing:-1.8px}.gzv-cv-midnight .gzv-cv-sidebar{order:2;margin:0 0 0 30px;border-top:3px solid var(--cv-accent)}.gzv-cv-midnight .gzv-cv-quote{font-family:Georgia,serif;font-size:16px}.gzv-cv-midnight .gzv-cv-project{border:1px solid var(--cv-line)}
.gzv-cv-editorial{--cv-ink:#352e2a;--cv-muted:#695c52;--cv-panel:#eee8de;--cv-line:#d9cfc3;background:#f7f3ed}.gzv-cv-editorial h1{font-family:Georgia,'Times New Roman',serif;text-transform:none;font-weight:400;font-size:45px;letter-spacing:-1.3px}.gzv-cv-editorial .gzv-cv-header{border-bottom:1px solid var(--cv-ink);padding-bottom:38px}.gzv-cv-editorial .gzv-cv-sidebar{background:none;padding:0 24px 0 0;border-right:1px solid var(--cv-line);border-radius:0}.gzv-cv-editorial .gzv-cv-avatar{border-radius:0;height:178px}.gzv-cv-editorial .gzv-cv-summary{font-family:Georgia,serif;font-size:17px;line-height:1.7}.gzv-cv-editorial .gzv-cv-project h3{font-family:Georgia,serif;font-size:25px;font-weight:400}.gzv-cv-editorial .gzv-cv-project{border-radius:0}.gzv-cv-editorial .gzv-cv-project-cover{padding:0 18px}.gzv-cv-editorial .gzv-cv-quote{font-family:Georgia,serif}
.gzv-cv-studio{--cv-panel:#f2f0ff;--cv-line:#dcd8ef}.gzv-cv-studio .gzv-cv-header{background:var(--cv-accent);padding:30px;border:0;border-radius:5px}.gzv-cv-studio .gzv-cv-header h1,.gzv-cv-studio .gzv-cv-header p{color:#fff}.gzv-cv-studio .gzv-cv-header h1{font-size:37px}.gzv-cv-studio .gzv-cv-avatar{border-radius:64px 64px 5px 5px;border:4px solid #fff}.gzv-cv-studio .gzv-cv-sidebar{width:210px;border-radius:5px 38px 5px 5px}.gzv-cv-studio .gzv-cv-main>section{counter-increment:cv-section}.gzv-cv-studio .gzv-cv-main>section>h2:before{content:counter(cv-section,decimal-leading-zero) ' / ';font-weight:400}.gzv-cv-studio .gzv-cv-project-topline{background:var(--cv-accent);color:#fff}.gzv-cv-studio .gzv-cv-project{border:1px solid var(--cv-line)}
.gzv-cv-portfolio{--cv-panel:#edf5f2;--cv-line:#cfe1da}.gzv-cv-portfolio .gzv-cv-header{border:0;padding:12px 0 30px}.gzv-cv-portfolio h1{font-size:43px;letter-spacing:-1.9px}.gzv-cv-portfolio .gzv-cv-avatar{width:148px;height:180px}.gzv-cv-portfolio .gzv-cv-sidebar{background:none;padding:0 20px 0 0;border-right:1px solid var(--cv-line);border-radius:0}.gzv-cv-portfolio .gzv-cv-section-heading h2{font-size:25px}.gzv-cv-portfolio .gzv-cv-project{background:none;border-radius:0;padding-bottom:26px;border-bottom:1px solid var(--cv-line)}.gzv-cv-portfolio .gzv-cv-project-body{padding:24px 0}.gzv-cv-portfolio .gzv-cv-project h3{font-size:27px}.gzv-cv-portfolio .gzv-cv-project-topline{padding:12px 0}.gzv-cv-portfolio .gzv-cv-gallery{padding:0;margin:-6px}
.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-columns{flex-direction:column}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-sidebar{order:2;width:100%;margin:26px 0 0;border:0}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-main{order:1}.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-gallery figure,.gzv-cv-compact:not(.gzv-cv-export) .gzv-cv-credential{width:calc(100% - 16px)}
@media(max-width:600px){.gzv-cv:not(.gzv-cv-export){padding:26px 22px;min-height:0}.gzv-cv:not(.gzv-cv-export) h1{font-size:26px}.gzv-cv:not(.gzv-cv-export) .gzv-cv-label{display:none}.gzv-cv:not(.gzv-cv-export) .gzv-cv-header{gap:16px}.gzv-cv-not(.gzv-cv-export) .gzv-cv-avatar{width:80px;height:108px}.gzv-cv:not(.gzv-cv-export) .gzv-cv-columns{grid-template-columns:1fr;gap:24px}}
@media(max-width:600px){.gzv-cv:not(.gzv-cv-export) .gzv-cv-columns{flex-direction:column}.gzv-cv:not(.gzv-cv-export) .gzv-cv-sidebar{order:2;width:100%;margin:26px 0 0;border:0}.gzv-cv:not(.gzv-cv-export) .gzv-cv-main{order:1}.gzv-cv:not(.gzv-cv-export) .gzv-cv-gallery figure,.gzv-cv:not(.gzv-cv-export) .gzv-cv-credential{width:calc(100% - 16px)}.gzv-cv:not(.gzv-cv-export) .gzv-cv-section-heading>span,.gzv-cv:not(.gzv-cv-export) .gzv-cv-footer>span{display:none}}
.gzv-cv p,.gzv-cv li,.gzv-cv-project p{font-size:14px;line-height:1.8}.gzv-cv-sidebar p{font-size:12px}.gzv-cv h2{font-size:12px}.gzv-cv .gzv-cv-contact a{font-size:11px}.gzv-cv .gzv-cv-skills span{font-size:11px}.gzv-cv h2,.gzv-cv h4,.gzv-cv .gzv-cv-eyebrow,.gzv-cv-project-links>a,.gzv-cv-credential a{color:var(--cv-accent-ink)}.gzv-cv-studio .gzv-cv-header h1,.gzv-cv-studio .gzv-cv-header p,.gzv-cv-studio .gzv-cv-project-topline{color:var(--cv-hero-ink)}

/* Layout Grid Modes (Placed at the end for clean cascade) */
.gzv-cv-project-grid{display:block;margin:0!important}
.gzv-cv-grid-1{display:block!important}
.gzv-cv-grid-1 .gzv-cv-project + .gzv-cv-project{margin-top:24px!important}

.gzv-cv-grid-2{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important}
.gzv-cv-grid-2 .gzv-cv-project{margin:0!important}
.gzv-cv-grid-2 .gzv-cv-project-body{padding:14px!important}
.gzv-cv-grid-2 .gzv-cv-project h3{font-size:15px!important;line-height:1.35!important;margin:0 0 6px!important}
.gzv-cv-grid-2 .gzv-cv-project p{font-size:11px!important;line-height:1.6!important}
.gzv-cv-grid-2 .gzv-cv-contribution{margin-top:10px!important;padding-left:10px!important}
.gzv-cv-grid-2 .gzv-cv-contribution h4{font-size:8.5px!important;margin-bottom:4px!important}
.gzv-cv-grid-2 .gzv-cv-tags{margin-top:10px!important}
.gzv-cv-grid-2 .gzv-cv-tags span{font-size:8px!important;padding:2px 6px!important}
.gzv-cv-grid-2 .gzv-cv-project-meta>span{font-size:8px!important;padding:2px 6px!important;margin:0 5px 5px 0!important}

.gzv-cv-grid-3{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
.gzv-cv-grid-3 .gzv-cv-project{margin:0!important;border-radius:4px!important}
.gzv-cv-grid-3 .gzv-cv-project-body{padding:10px!important}
.gzv-cv-grid-3 .gzv-cv-project h3{font-size:12px!important;line-height:1.3!important;margin:0 0 4px!important}
.gzv-cv-grid-3 .gzv-cv-project p{font-size:9.5px!important;line-height:1.45!important}
.gzv-cv-grid-3 .gzv-cv-contribution{margin-top:6px!important;padding-left:6px!important}
.gzv-cv-grid-3 .gzv-cv-contribution h4{font-size:7.5px!important;margin-bottom:2px!important}
.gzv-cv-grid-3 .gzv-cv-tags{margin-top:6px!important}
.gzv-cv-grid-3 .gzv-cv-tags span{font-size:7.5px!important;padding:1.5px 4px!important}
.gzv-cv-grid-3 .gzv-cv-project-meta>span{font-size:7px!important;padding:1px 4px!important;margin:0 3px 3px 0!important}
.gzv-cv-grid-3 .gzv-cv-project-links>a{font-size:8px!important;margin-top:4px!important}
.gzv-cv-grid-3 .gzv-cv-project-topline{padding:8px 10px!important;font-size:7.5px!important}
`ntial a{color:var(--cv-accent-ink)}.gzv-cv-studio .gzv-cv-header h1,.gzv-cv-studio .gzv-cv-header p,.gzv-cv-studio .gzv-cv-project-topline{color:var(--cv-hero-ink)}
@media print{.gzv-cv{box-shadow:none;max-width:none;width:210mm;padding:12mm;print-color-adjust:exact;-webkit-print-color-adjust:exact}.gzv-cv section,.gzv-cv-project{break-inside:auto}.gzv-cv h2,.gzv-cv h3,.gzv-cv h4{break-after:avoid}.gzv-cv figure,.gzv-cv-credential{break-inside:avoid}.gzv-cv figure img{max-height:250mm;object-fit:contain}.gzv-cv-footer{position:static}}
`

const pdfCache = new Map<string, { markup: string; blob: Blob }>()
const pdfPending = new Map<string, { markup: string; promise: Promise<Blob> }>()
let pdfCacheBytes = 0

function saveCvBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url; link.download = filename
  document.body.appendChild(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}

// Cache the completed PDF in memory. Any draft, template, image or revision change regenerates it.
export async function downloadCvPdf(element: HTMLElement, slug: string, loadPdf: () => Promise<any>) {
  const filename = `CV-${(slug || "GZVer").replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`
  const markup = element.outerHTML
  const cached = pdfCache.get(filename)
  if (cached?.markup === markup) { saveCvBlob(cached.blob, filename); return }
  const running = pdfPending.get(filename)
  if (running?.markup === markup) { saveCvBlob(await running.promise, filename); return }
  const promise = createCvPdf(element, loadPdf)
  pdfPending.set(filename, { markup, promise })
  try {
    const blob = await promise
    if (pdfPending.get(filename)?.promise !== promise) { saveCvBlob(blob, filename); return }
    const old = pdfCache.get(filename)
    if (old) pdfCacheBytes -= old.blob.size
    pdfCache.delete(filename); pdfCache.set(filename, { markup, blob }); pdfCacheBytes += blob.size
    while (pdfCache.size > 6 || pdfCacheBytes > 48 * 1024 * 1024) {
      const key = pdfCache.keys().next().value as string
      pdfCacheBytes -= pdfCache.get(key)!.blob.size; pdfCache.delete(key)
    }
    saveCvBlob(blob, filename)
  } finally { if (pdfPending.get(filename)?.promise === promise) pdfPending.delete(filename) }
}

// Native A4 printing keeps text selectable and preserves the entire long portfolio.
export async function printCvDocument(element: HTMLElement) {
  const frame = document.createElement("iframe")
  frame.title = "In CV A4"
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;"
  document.body.appendChild(frame)
  const target = frame.contentWindow
  if (!target) { frame.remove(); throw new Error("Không mở được bản in CV.") }
  try {
    const copy = element.cloneNode(true) as HTMLElement
    copy.classList.remove("gzv-cv-compact")
    copy.classList.add("gzv-cv-export")
    target.document.open()
    target.document.write(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><base href="${window.location.origin}/"><title>CV GZVer</title><style>@page{size:A4;margin:0}body{margin:0;background:white}</style></head><body>${copy.outerHTML}</body></html>`)
    target.document.close()
    await target.document.fonts.ready
    await Promise.all(Array.from(target.document.images).map((image) => image.decode()))
    target.addEventListener("afterprint", () => frame.remove(), { once: true })
    target.focus(); target.print()
    setTimeout(() => frame.remove(), 60000)
  } catch { frame.remove(); throw new Error("Không tải được bản in CV. Vui lòng kiểm tra ảnh và thử lại.") }
}

// Capture at desktop width, then size one PDF page to the actual canvas without A4 slicing.
async function createCvPdf(element: HTMLElement, loadPdf: () => Promise<any>): Promise<Blob> {
  const clone = element.cloneNode(true) as HTMLElement
  clone.classList.add("gzv-cv-export")
  clone.style.width = "794px"
  clone.style.maxWidth = "none"
  clone.style.margin = "0"
  const host = document.createElement("div")
  host.style.cssText = "position:absolute;left:-10000px;top:0;width:794px;pointer-events:none;"
  host.appendChild(clone)
  document.body.appendChild(host)
  let worker: any
  try {
    await document.fonts.ready
    await Promise.all(Array.from(clone.querySelectorAll("img")).map(async (img) => {
      img.crossOrigin = "anonymous"
      img.loading = "eager"
      await img.decode().catch(() => { throw new Error("Không tải được ảnh trong CV. Vui lòng kiểm tra ảnh và thử lại.") })
    }))
    const html2pdf = await loadPdf()
    const height = Math.ceil(clone.getBoundingClientRect().height)
    if (height * 210 / 794 > 5000) throw new Error("CV quá dài để xuất thành một trang PDF. Bạn có thể dùng In A4 để lưu đầy đủ nội dung.")
    const scale = Math.min(2, 16000 / Math.max(794, height), Math.sqrt(24000000 / (794 * height)))
    worker = html2pdf().set({
      margin: 0, pagebreak: { mode: [] },
      html2canvas: { scale, useCORS: true, backgroundColor: null, logging: false, windowWidth: 1200, scrollX: 0, scrollY: 0 },
      jsPDF: { unit: "mm", format: [210, height * 210 / 794 + 1], orientation: "portrait" },
    })
    const canvas: HTMLCanvasElement = await worker.from(clone).toCanvas().get("canvas")
    const pageHeight = canvas.height * 210 / canvas.width + 1
    if (pageHeight > 5000) throw new Error("CV quá dài để xuất thành một trang PDF. Vui lòng rút gọn nội dung.")
    const blob: Blob = await html2pdf().set({
      margin: 0, image: { type: "jpeg", quality: 0.98 },
      jsPDF: { unit: "mm", format: [210, pageHeight], orientation: "portrait", compress: true },
    }).from(canvas).outputPdf("blob")
    canvas.width = 0; canvas.height = 0
    return blob
  } finally {
    worker?.prop?.overlay?.remove()
    host.remove()
  }
}
