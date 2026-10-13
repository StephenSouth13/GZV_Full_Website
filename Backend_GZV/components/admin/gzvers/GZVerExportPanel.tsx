"use client"

import { useEffect, useMemo, useState } from "react"
import { Archive, FileSpreadsheet, Loader2, Printer, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const safeName = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "file"
const parseObject = (value: any) => value && typeof value === "object" ? value : (() => { try { return JSON.parse(value || "{}") } catch { return {} } })()
const downloadBlob = (blob: Blob, name: string) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
const escapeHtml = (value: unknown) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char))

export function GZVerExportPanel({ gzvers }: { gzvers: any[] }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [selected, setSelected] = useState<Set<string>>(() => new Set(gzvers.map((item) => item.id)))
  const [busy, setBusy] = useState<"excel" | "zip" | "print" | null>(null)
  useEffect(() => { void supabase.auth.getUser().then(async ({ data }) => { if (!data.user) return setIsAdmin(false); const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle(); setIsAdmin(profile?.role === "admin") }) }, [])
  useEffect(() => setSelected((current) => current.size ? current : new Set(gzvers.map((item) => item.id))), [gzvers])
  const chosen = useMemo(() => gzvers.filter((item) => selected.has(item.id)), [gzvers, selected])

  const loadExportData = async () => {
    const ids = chosen.map((item) => item.id)
    const linkedIds = chosen.map((item) => item.linked_author_id).filter(Boolean)
    const [{ data: projects, error: projectError }, { data: highlights, error: highlightError }, { data: positions, error: positionError }] = await Promise.all([
      supabase.from("projects").select("*").order("order_index", { ascending: true }),
      ids.length ? supabase.from("gzver_project_highlights").select("*").in("gzver_id", ids) : Promise.resolve({ data: [], error: null } as any),
      supabase.from("gzver_positions").select("*").order("sort_order", { ascending: true }),
    ])
    if (projectError) throw projectError; if (highlightError) throw highlightError; if (positionError) throw positionError
    const identities = new Set([...ids, ...linkedIds])
    const relatedProjects = (projects || []).filter((project: any) => (project.author_ids || []).some((id: string) => identities.has(id)) || (highlights || []).some((h: any) => h.project_id === project.id))
    const associations = chosen.flatMap((member) => relatedProjects.filter((project: any) => (project.author_ids || []).includes(member.id) || (member.linked_author_id && (project.author_ids || []).includes(member.linked_author_id)) || (highlights || []).some((h: any) => h.gzver_id === member.id && h.project_id === project.id)).map((project: any) => {
      const highlight = (highlights || []).find((h: any) => h.gzver_id === member.id && h.project_id === project.id)
      return { gzver_id: member.id, gzver_name: member.full_name, project_id: project.id, project_title: project.title, contribution: highlight?.contribution || "", highlight_images: highlight?.image_urls || [], visible: highlight?.is_visible !== false }
    }))
    return { members: chosen, projects: relatedProjects, highlights: highlights || [], associations, positions: positions || [] }
  }

  const buildWorkbook = async (data: Awaited<ReturnType<typeof loadExportData>>) => {
    const XLSX = await import("xlsx")
    const wb = XLSX.utils.book_new()
    const memberRows = data.members.map((m) => ({ ID: m.id, "Họ tên": m.full_name, Slug: m.slug, "Chức danh": m.position, "Công ty": m.company, "Phòng ban": m.department_name || m.gzver_departments?.name, Email: m.email, "Điện thoại": m.phone, "Website": m.website_url, "Ảnh đại diện": m.avatar_url, "Ảnh bìa": m.cover_image_url, "Đang hiển thị": m.is_active !== false, "Thứ tự": m.order, "Cập nhật": m.updated_at }))
    const projectRows = data.projects.map((p: any) => ({ ID: p.id, "Tên dự án": p.title, Slug: p.slug, "Danh mục": p.category, "Trạng thái": p.status, "Mô tả": p.description, "Ảnh chính": p.image || p.thumbnail_url, "Thư viện ảnh": (p.gallery || []).join("\n"), "Liên kết": p.external_url || p.demo_url, "Cập nhật": p.updated_at }))
    const associationRows = data.associations.map((a) => ({ "GZVer ID": a.gzver_id, "GZVer": a.gzver_name, "Dự án ID": a.project_id, "Dự án": a.project_title, "Đóng góp": a.contribution, "Ảnh chi tiết": a.highlight_images.join("\n"), "Hiển thị": a.visible }))
    const positionRows = data.positions.map((position: any) => ({ ID: position.id, "Tên chức danh": position.name, "Đang sử dụng": position.is_active !== false, "Thứ tự": position.sort_order, "Ngày tạo": position.created_at, "Cập nhật": position.updated_at }))
    for (const [name, rows] of [["GZVers", memberRows], ["Danh mục chức danh", positionRows], ["Dự án", projectRows], ["GZVer - Dự án", associationRows]] as const) {
      const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ "Không có dữ liệu": "" }]); ws["!autofilter"] = { ref: ws["!ref"] || "A1:A1" }; ws["!freeze"] = { xSplit: 0, ySplit: 1 }; ws["!cols"] = Object.keys(rows[0] || { empty: "" }).map((key) => ({ wch: Math.min(45, Math.max(12, key.length + 4)) })); XLSX.utils.book_append_sheet(wb, ws, name)
    }
    return new Blob([XLSX.write(wb, { type: "array", bookType: "xlsx" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  }

  const exportExcel = async () => { setBusy("excel"); try { downloadBlob(await buildWorkbook(await loadExportData()), `gzvers-backup-${new Date().toISOString().slice(0, 10)}.xlsx`) } catch (e: any) { toast.error(e.message) } finally { setBusy(null) } }
  const exportZip = async () => {
    setBusy("zip")
    try {
      const data = await loadExportData(); const [{ default: JSZip }, xlsxBlob] = await Promise.all([import("jszip"), buildWorkbook(data)]); const zip = new JSZip(); zip.file("gzvers.xlsx", xlsxBlob); zip.file("data.json", JSON.stringify(data, null, 2)); const failures: string[] = []
      const urls = new Map<string, string>(); const add = (folder: string, url: any, label: string) => { if (typeof url === "string" && /^https?:\/\//.test(url)) urls.set(`${folder}/${safeName(label)}-${urls.size + 1}.${(url.split("?")[0].split(".").pop() || "jpg").slice(0, 5)}`, url) }
      data.members.forEach((m) => { add(`images/gzvers/${safeName(m.slug || m.id)}`, m.avatar_url, "avatar"); add(`images/gzvers/${safeName(m.slug || m.id)}`, m.cover_image_url, "cover"); const card = parseObject(m.member_card); add(`images/cards/${safeName(m.slug || m.id)}`, card.front_image_url, "front"); add(`images/cards/${safeName(m.slug || m.id)}`, card.back_image_url, "back"); (m.online_cards || []).forEach((c: any, i: number) => { add(`images/cards/${safeName(m.slug || m.id)}`, c.front_image_url, `credential-${i + 1}-front`); add(`images/cards/${safeName(m.slug || m.id)}`, c.back_image_url, `credential-${i + 1}-back`) }) })
      data.projects.forEach((p: any) => { add(`images/projects/${safeName(p.slug || p.id)}`, p.image || p.thumbnail_url, "cover"); (p.gallery || []).forEach((url: string, i: number) => add(`images/projects/${safeName(p.slug || p.id)}`, url, `gallery-${i + 1}`)) }); data.associations.forEach((a) => a.highlight_images.forEach((url: string, i: number) => add(`images/highlights/${safeName(a.gzver_name)}`, url, `${safeName(a.project_title)}-${i + 1}`)))
      await Promise.all([...urls].map(async ([path, url]) => { try { const response = await fetch(url); if (!response.ok) throw new Error(String(response.status)); zip.file(path, await response.blob()) } catch { failures.push(url) } })); if (failures.length) zip.file("images-khong-tai-duoc.txt", failures.join("\n")); downloadBlob(await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }), `gzvers-full-backup-${new Date().toISOString().slice(0, 10)}.zip`)
    } catch (e: any) { toast.error(e.message) } finally { setBusy(null) }
  }
  const printCards = () => { setBusy("print"); const win = window.open("", "_blank"); if (!win) { setBusy(null); return toast.error("Trình duyệt đang chặn cửa sổ in") } const cards = chosen.flatMap((m) => { const card = parseObject(m.member_card); const face = (side: "front" | "back") => { const x = Math.min(100, Math.max(0, Number(card[`${side}_position_x`]) || 50)); const y = Math.min(100, Math.max(0, Number(card[`${side}_position_y`]) || 50)); const scale = Math.min(2.5, Math.max(1, (Number(card[`${side}_scale`]) || 100) / 100)); return card[`${side}_image_url`] ? `<div class="card"><img src="${escapeHtml(card[`${side}_image_url`])}" style="object-position:${x}% ${y}%;transform:scale(${scale});transform-origin:${x}% ${y}%" /></div>` : `<div class="card generated"><b>GZV</b><img class="avatar" src="${escapeHtml(m.avatar_url)}"/><h2>${escapeHtml(m.full_name)}</h2><p>${escapeHtml(m.position)}</p><small>${escapeHtml(side === "front" ? card.card_number || m.slug : m.department_name)}</small></div>` }; return [face("front"), face("back")] }).join(""); win.document.write(`<!doctype html><html><head><title>In thẻ GZVer</title><style>@page{size:A4;margin:8mm}*{box-sizing:border-box}body{margin:0;display:grid;grid-template-columns:repeat(3,54mm);gap:5mm;font-family:Arial}.card{width:54mm;height:85.6mm;overflow:hidden;break-inside:avoid;border:0.2mm solid #bbb;background:#08090d;color:white}.card>img:not(.avatar){width:100%;height:100%;object-fit:cover}.generated{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:5mm;border-top:2mm solid #ed1c24}.generated>b{font-size:12mm;color:#ed1c24}.avatar{width:28mm;height:32mm;object-fit:cover;border:1mm solid white}.generated h2{font-size:4mm;margin:3mm 0 1mm}.generated p,.generated small{font-size:2.7mm;margin:1mm}</style></head><body>${cards}<script>Promise.all(Array.from(document.images).map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=i.onerror=r}))).then(()=>setTimeout(()=>window.print(),200))<\/script></body></html>`); win.document.close(); setBusy(null) }

  if (isAdmin === null) return <div className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#ed1c24]" /></div>
  if (!isAdmin) return <div className="flex items-center gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><ShieldAlert className="h-5 w-5" />Chỉ tài khoản Admin được in thẻ và xuất dữ liệu backup.</div>
  return <div className="space-y-5 border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900"><div><h3 className="text-sm font-black uppercase">Xuất dữ liệu & Backup</h3><p className="mt-1 text-xs text-slate-500">Chọn GZVer rồi xuất Excel, ZIP đầy đủ ảnh hoặc in thẻ vật lý hàng loạt.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" className="rounded-none" onClick={() => setSelected(new Set(gzvers.map((m) => m.id)))}>Chọn tất cả</Button><Button variant="outline" className="rounded-none" onClick={() => setSelected(new Set())}>Bỏ chọn</Button><span className="self-center text-xs font-bold text-[#ed1c24]">Đã chọn {chosen.length}/{gzvers.length}</span></div><div className="grid max-h-64 gap-2 overflow-y-auto border border-slate-200 p-3 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-3">{gzvers.map((m) => <label key={m.id} className="flex items-center gap-2 border border-slate-100 p-2 text-xs dark:border-white/5"><Switch checked={selected.has(m.id)} onCheckedChange={(checked) => setSelected((current) => { const next = new Set(current); checked ? next.add(m.id) : next.delete(m.id); return next })}/><span className="min-w-0"><b className="block truncate">{m.full_name}</b><span className="block truncate text-slate-500">{m.position || "Chưa có chức danh"}</span></span></label>)}</div><div className="grid gap-3 md:grid-cols-3"><Button disabled={!chosen.length || !!busy} onClick={() => void exportExcel()} className="h-12 rounded-none bg-emerald-600 text-white hover:bg-emerald-700">{busy === "excel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}Xuất Excel</Button><Button disabled={!chosen.length || !!busy} onClick={() => void exportZip()} className="h-12 rounded-none bg-slate-900 text-white hover:bg-black"><Archive className="mr-2 h-4 w-4" />ZIP dữ liệu + hình ảnh</Button><Button disabled={!chosen.length || !!busy} onClick={printCards} className="h-12 rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218]"><Printer className="mr-2 h-4 w-4" />In thẻ hàng loạt</Button></div></div>
}
