//D:\gzv\Backend_gzv\app\admin\training\[id]\page.tsx
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'

import { TrainingService } from '@/lib/training-service'
import { Program } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ChevronLeft, Loader2, Bold, Italic, 
  Heading1, Heading2, List, Image as ImgIcon, Youtube as YtIcon 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function TrainingEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(params.id !== 'new')
  const [data, setData] = useState<Partial<Program>>({ 
    title: '', slug: '', level: 'Cơ bản', status: 'draft', content: null 
  })

  // 1. Khởi tạo Editor - Đã Fix lỗi SSR
  const editor = useEditor({
    extensions: [
      StarterKit, 
      Image.configure({ HTMLAttributes: { class: 'rounded-3xl shadow-2xl my-10 border-4 border-white' } }), 
      Youtube.configure({ width: 800, height: 450, HTMLAttributes: { class: 'rounded-3xl my-10 overflow-hidden shadow-2xl' } }),
      LinkExtension.configure({ openOnClick: false })
    ],
    // Dòng quan trọng nhất để fix lỗi SSR sếp gặp:
    immediatelyRender: false, 
    
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[600px] p-10 text-xl font-serif leading-relaxed text-slate-800' }
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      setData((prev: any) => ({ ...prev, content: json }))
    }
  })

  // 2. Load dữ liệu từ Database
  useEffect(() => {
    if (params.id && params.id !== 'new') {
      TrainingService.getProgramById(params.id as string).then(res => {
        if (res) {
          setData(res)
          if (editor && res.content) {
            editor.commands.setContent(res.content)
          }
        }
        setFetching(false)
      })
    } else {
      setFetching(false)
    }
  }, [params.id, editor])

  // 3. Hàm xử lý lưu
  const handleSave = async () => {
    if (!data.title) {
      toast({ title: "LỖI", description: "Vui lòng nhập tiêu đề chương trình", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await TrainingService.saveProgram(data)
      toast({ title: "THÀNH CÔNG", description: "Khóa học đã được lưu." })
      router.push('/admin/training')
      router.refresh()
    } catch (error) {
      toast({ title: "LỖI", description: "Không thể lưu dữ liệu.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // 4. Các hàm Toolbar (Né lỗi TS)
  const exec = (action: string) => {
    if (!editor) return
    const cmd = (editor as any).chain().focus()
    if (action === 'bold') cmd.toggleBold().run()
    if (action === 'italic') cmd.toggleItalic().run()
    if (action === 'h1') cmd.toggleHeading({ level: 1 }).run()
    if (action === 'h2') cmd.toggleHeading({ level: 2 }).run()
    if (action === 'list') cmd.toggleBulletList().run()
  }

  // Màn hình chờ khởi tạo
  if (fetching || !editor) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">gzv Center đang khởi tạo...</p>
      </div>
    </div>
  )

  return (
    <div className="p-10 space-y-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      {/* Thanh điều khiển trên cùng */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] sticky top-6 z-50 border border-white/50 shadow-2xl">
        <Button variant="ghost" onClick={() => router.back()} className="font-black text-slate-400 hover:text-slate-900 uppercase text-[10px] tracking-widest">
          <ChevronLeft className="mr-2" size={20}/> Quay lại
        </Button>
        <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-12 h-14 font-black text-white shadow-xl shadow-blue-500/30 transition-all active:scale-95">
          {loading ? <Loader2 className="animate-spin mr-2" /> : "XÁC NHẬN LƯU"}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* KHU VỰC SOẠN THẢO CHÍNH */}
        <div className="col-span-8 space-y-8">
          <div className="bg-white p-20 rounded-[4rem] shadow-2xl border border-slate-100/50 space-y-10 relative">
            <Input 
              value={data.title}
              onChange={(e) => {
                const val = e.target.value
                setData({...data, title: val, slug: TrainingService.generateSlug(val)})
              }}
              placeholder="NHẬP TIÊU ĐỀ KHÓA HỌC..."
              className="text-6xl font-black border-none p-0 h-auto focus-visible:ring-0 shadow-none placeholder:text-slate-100 tracking-tighter uppercase italic"
            />

            {/* Toolbar Docs Style */}
            <div className="flex items-center gap-1 p-2 bg-slate-900 rounded-[1.5rem] w-fit shadow-2xl sticky top-32 z-40 border border-white/10">
              <Button size="icon" variant="ghost" onClick={() => exec('bold')} className={editor.isActive('bold') ? 'text-blue-400' : 'text-slate-400'}><Bold size={18}/></Button>
              <Button size="icon" variant="ghost" onClick={() => exec('italic')} className={editor.isActive('italic') ? 'text-blue-400' : 'text-slate-400'}><Italic size={18}/></Button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <Button size="icon" variant="ghost" onClick={() => exec('h1')} className={editor.isActive('heading', { level: 1 }) ? 'text-blue-400' : 'text-slate-400'}><Heading1 size={18}/></Button>
              <Button size="icon" variant="ghost" onClick={() => exec('h2')} className={editor.isActive('heading', { level: 2 }) ? 'text-blue-400' : 'text-slate-400'}><Heading2 size={18}/></Button>
              <Button size="icon" variant="ghost" onClick={() => exec('list')} className={editor.isActive('bulletList') ? 'text-blue-400' : 'text-slate-400'}><List size={18}/></Button>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <Button size="icon" variant="ghost" onClick={() => {
                const url = prompt('Dán link ảnh tại đây:'); if(url) (editor as any).chain().focus().setImage({ src: url }).run()
              }} className="text-slate-400"><ImgIcon size={18}/></Button>
              <Button size="icon" variant="ghost" onClick={() => {
                const url = prompt('Dán link YouTube:'); if(url) editor.commands.setYoutubeVideo({ src: url })
              }} className="text-slate-400"><YtIcon size={18}/></Button>
            </div>

            <EditorContent editor={editor} />
          </div>
        </div>

        {/* SIDEBAR CÀI ĐẶT NHANH */}
        <div className="col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-10">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">Thiết lập chung</h4>
            
            <div>
              <Label className="font-black text-[10px] text-slate-500 uppercase tracking-widest">Đường dẫn (Slug)</Label>
              <Input value={data.slug} readOnly className="mt-4 h-12 rounded-xl bg-slate-50 border-none font-bold text-blue-600" />
            </div>

            <div>
              <Label className="font-black text-[10px] text-slate-500 uppercase tracking-widest">Cấp độ</Label>
              <select 
                value={data.level}
                onChange={(e) => setData({...data, level: e.target.value})}
                className="w-full mt-4 h-14 rounded-2xl bg-slate-50 border-none font-black px-6 outline-none appearance-none"
              >
                <option>Cơ bản</option>
                <option>Trung cấp</option>
                <option>Nâng cao</option>
                <option>Chuyên gia</option>
              </select>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <Label className="font-black text-[10px] text-slate-500 uppercase tracking-widest mb-4 block">Hiển thị</Label>
              <div className="flex gap-4">
                <Button 
                  variant={data.status === 'published' ? 'default' : 'outline'}
                  onClick={() => setData({...data, status: 'published'})}
                  className={data.status === 'published' ? 'bg-emerald-500 flex-1 rounded-xl font-black' : 'flex-1 rounded-xl font-bold'}
                >LIVE</Button>
                <Button 
                  variant={data.status === 'draft' ? 'default' : 'outline'}
                  onClick={() => setData({...data, status: 'draft'})}
                  className={data.status === 'draft' ? 'bg-amber-500 flex-1 rounded-xl font-black' : 'flex-1 rounded-xl font-bold'}
                >DRAFT</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}