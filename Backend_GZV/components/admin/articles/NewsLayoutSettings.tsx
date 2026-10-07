"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { DEFAULT_NEWS_LAYOUT, resolveNewsLayout } from '../../../../shared/data/news-layout'

export function NewsLayoutSettings() {
  const [columns, setColumns] = useState(String(DEFAULT_NEWS_LAYOUT.columns))
  const [rows, setRows] = useState(String(DEFAULT_NEWS_LAYOUT.rows))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let active = true
    void supabase.from('site_home_sections').select('settings').eq('section_key', 'news').maybeSingle().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setLoadFailed(true)
        toast({ title: 'Không thể tải cấu hình tin tức', description: error.message, variant: 'destructive' })
      } else {
        const layout = resolveNewsLayout(data?.settings)
        setColumns(String(layout.columns))
        setRows(String(layout.rows))
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const columnCount = Number(columns)
  const rowCount = Number(rows)
  const valid = Number.isInteger(columnCount) && columnCount >= 1 && columnCount <= 4 &&
    Number.isInteger(rowCount) && rowCount >= 1 && rowCount <= 10

  const save = async () => {
    if (!valid || saving) return
    setSaving(true)
    try {
      const { data, error } = await supabase.from('site_home_sections').select('id,settings').eq('section_key', 'news').maybeSingle()
      if (error) throw error
      const settings = { ...(data?.settings || {}), news_listing_columns: columnCount, news_listing_rows: rowCount }
      const result = data
        ? await supabase.from('site_home_sections').update({ settings }).eq('id', data.id).select('id').single()
        : await supabase.from('site_home_sections').insert({ section_key: 'news', title: 'TIN TỨC & BÀI VIẾT MỚI NHẤT', settings, sort_order: 70 }).select('id').single()
      if (result.error) throw result.error
      toast({ title: 'Đã lưu bố cục tin tức', description: `${columnCount} bài mỗi hàng × ${rowCount} hàng = ${columnCount * rowCount} bài mỗi trang.` })
    } catch (error) {
      toast({ title: 'Không thể lưu cấu hình', description: error instanceof Error ? error.message : (error as { message?: string }).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4 border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900" aria-labelledby="news-layout-title">
      <div>
        <h3 id="news-layout-title" className="text-sm font-black uppercase">Bố cục bài viết trên /tin-tuc</h3>
        <p className="mt-1 text-xs text-slate-500">Cấu hình danh sách bài viết trên máy tính. Điện thoại tự giảm số cột; bài nổi bật hiển thị riêng phía trên.</p>
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="space-y-2 text-xs font-bold">
          <span className="block">Số bài mỗi hàng (1–4)</span>
          <Input type="number" min={1} max={4} step={1} value={columns} onChange={event => setColumns(event.target.value)} disabled={loading || saving || loadFailed} className="w-44 rounded-none" />
        </label>
        <label className="space-y-2 text-xs font-bold">
          <span className="block">Số hàng mỗi trang (1–10)</span>
          <Input type="number" min={1} max={10} step={1} value={rows} onChange={event => setRows(event.target.value)} disabled={loading || saving || loadFailed} className="w-44 rounded-none" />
        </label>
        <Button onClick={save} disabled={loading || saving || loadFailed || !valid} className="rounded-none bg-[#ed1c24] text-white hover:bg-[#c91218]">{saving ? 'Đang lưu...' : 'Lưu bố cục'}</Button>
      </div>
      <p className="text-xs text-slate-500" aria-live="polite">{loading ? 'Đang tải cấu hình...' : loadFailed ? 'Tải lại trang để thử tải cấu hình.' : valid ? `${columnCount * rowCount} bài mỗi trang (${columnCount} bài × ${rowCount} hàng). Các bài tiếp theo chuyển sang trang kế tiếp.` : 'Nhập số nguyên trong phạm vi cho phép.'}</p>
    </section>
  )
}
