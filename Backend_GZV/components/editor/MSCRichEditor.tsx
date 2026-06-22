"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from '@tiptap/extension-color'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Underline as UIcon, Strikethrough, Highlighter,
  List, ListOrdered, Quote, Code2, Link2, Image as ImageIcon,
  Youtube as YT, Minus, Undo2, Redo2,
  Loader2, Type, Palette, Eraser, FolderOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { MediaPickerDialog, type MediaPickResult } from '@/components/media/MediaPickerDialog'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  uploadFolder?: string
}

const FONTS = ['Inter', 'Georgia', 'Merriweather', 'Roboto Mono', 'Playfair Display', 'Times New Roman']
const COLORS = [
  '#0f172a', '#475569', '#94a3b8', '#dc2626', '#ea580c',
  '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777',
]

function ToolButton({
  onClick, active, disabled, title, children,
}: any) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'h-9 min-w-9 px-2 rounded-md flex items-center justify-center gap-1.5 text-[13px] font-medium',
        'transition-colors border border-transparent',
        active
          ? 'bg-blue-100 text-blue-700 border-blue-200'
          : 'text-slate-700 hover:bg-slate-100',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="w-px h-6 bg-slate-200 mx-1 self-center" />

export function MSCRichEditor({
  value, onChange, placeholder = 'Bắt đầu viết câu chuyện của bạn…',
  minHeight = 720, uploadFolder = 'articles',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { HTMLAttributes: { class: 'rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-sm my-4' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-blue-500 pl-4 italic my-4 text-slate-600' } },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline underline-offset-2' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-2xl shadow-lg my-6 w-full' },
        allowBase64: false,
      }),
      Youtube.configure({
        width: 800, height: 450,
        HTMLAttributes: { class: 'rounded-2xl my-6 w-full aspect-video' },
      }),
    ],
    content: value || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'msc-doc-editor focus:outline-none prose prose-slate max-w-none ' +
          'prose-headings:font-black prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl ' +
          'prose-p:text-[17px] prose-p:leading-8 prose-p:text-slate-800 ' +
          'prose-strong:text-slate-900 prose-a:text-blue-600 ' +
          'prose-img:rounded-2xl prose-img:shadow-lg ' +
          'prose-blockquote:not-italic prose-blockquote:font-medium ' +
          'prose-li:marker:text-blue-500',
        style: `min-height: ${minHeight}px; padding: 64px 88px;`,
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Sync external value changes (when modal opens with existing content)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value && value !== current) editor.commands.setContent(value, { emitUpdate: false })
  }, [value, editor])

  const onUploadImage = useCallback(async (file: File) => {
    if (!editor || !file) return
    setUploading(true)
    try {
      const path = `${uploadFolder}/${Date.now()}_${file.name.replace(/\s+/g, '-')}`
      const { error } = await supabase.storage.from('media').upload(path, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
      editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run()
      toast({ title: 'Đã chèn ảnh vào bài viết' })
    } catch (err: any) {
      toast({ title: 'Lỗi tải ảnh', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }, [editor, uploadFolder])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    const url = window.prompt('Dán đường dẫn liên kết:', prev || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run()
  }, [editor])

  const insertYoutube = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Dán link YouTube:')
    if (!url) return
    editor.commands.setYoutubeVideo({ src: url })
  }, [editor])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={18} /> Đang khởi tạo trình soạn thảo…
      </div>
    )
  }

  const isHeading = (lv: 1 | 2 | 3) => editor.isActive('heading', { level: lv })

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* RIBBON */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100">
        {/* Row 1: Style group + paragraph styles */}
        <div className="flex flex-wrap items-center gap-1 px-3 py-2">
          <ToolButton title="Hoàn tác" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo2 size={16} />
          </ToolButton>
          <ToolButton title="Làm lại" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo2 size={16} />
          </ToolButton>
          <Divider />

          {/* Paragraph style select */}
          <select
            className="h-9 px-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={
              isHeading(1) ? 'h1'
              : isHeading(2) ? 'h2'
              : isHeading(3) ? 'h3'
              : 'p'
            }
            onChange={(e) => {
              const v = e.target.value
              const chain = editor.chain().focus()
              if (v === 'p') chain.setParagraph().run()
              else chain.toggleHeading({ level: Number(v.replace('h', '')) as 1 | 2 | 3 }).run()
            }}
          >
            <option value="p">Văn bản thường</option>
            <option value="h1">Tiêu đề 1</option>
            <option value="h2">Tiêu đề 2</option>
            <option value="h3">Tiêu đề 3</option>
          </select>

          {/* Font family via inline style */}
          <select
            className="h-9 px-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            onChange={(e) => {
              const f = e.target.value
              if (!f) return
              editor.chain().focus().setMark('textStyle', { fontFamily: f } as any).run()
            }}
            defaultValue=""
          >
            <option value="" disabled>Phông chữ</option>
            {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
          </select>

          <Divider />
          <ToolButton title="In đậm (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold size={16} /></ToolButton>
          <ToolButton title="In nghiêng (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic size={16} /></ToolButton>
          <ToolButton title="Gạch chân (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><UIcon size={16} /></ToolButton>
          <ToolButton title="Gạch ngang" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough size={16} /></ToolButton>

          {/* Text color */}
          <div className="relative group">
            <ToolButton title="Màu chữ"><Palette size={16} /></ToolButton>
            <div className="absolute hidden group-hover:grid grid-cols-6 gap-1 p-2 bg-white border border-slate-200 rounded-xl shadow-xl z-30 top-full mt-1">
              {COLORS.map(c => (
                <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().setColor(c).run()}
                  className="w-6 h-6 rounded-md border border-slate-200 hover:scale-110 transition"
                  style={{ background: c }} />
              ))}
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().unsetColor().run()}
                className="col-span-6 mt-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 justify-center py-1">
                <Eraser size={12} /> Bỏ màu
              </button>
            </div>
          </div>

          <ToolButton title="Đánh dấu" onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={editor.isActive('highlight')}><Highlighter size={16} /></ToolButton>

          <Divider />
          <ToolButton title="Danh sách dấu chấm" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List size={16} /></ToolButton>
          <ToolButton title="Danh sách số" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered size={16} /></ToolButton>
          <ToolButton title="Trích dẫn" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote size={16} /></ToolButton>
          <ToolButton title="Khối mã" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}><Code2 size={16} /></ToolButton>
          <ToolButton title="Đường kẻ ngang" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></ToolButton>

          <Divider />
          <ToolButton title="Chèn liên kết" onClick={setLink} active={editor.isActive('link')}><Link2 size={16} /></ToolButton>
          <ToolButton title="Tải ảnh từ máy" onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          </ToolButton>
          <ToolButton title="Chèn ảnh từ thư viện" onClick={() => setPickerOpen(true)}>
            <FolderOpen size={16} />
          </ToolButton>
          <ToolButton title="Chèn YouTube" onClick={insertYoutube}><YT size={16} /></ToolButton>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadImage(f); e.target.value = '' }}
          />

          <div className="ml-auto flex items-center gap-2 text-[11px] font-bold text-slate-400 pr-2">
            <Type size={12} /> {editor.storage.characterCount?.characters?.() ?? editor.getText().length} ký tự
          </div>
        </div>
      </div>

      {/* PAGE CANVAS */}
      <div className="bg-[#f8fafc] py-10 px-6 lg:px-16 overflow-auto">
        <div className="max-w-[850px] mx-auto bg-white rounded-2xl shadow-[0_6px_30px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/60">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Placeholder + page styles */}
      <style jsx global>{`
        .msc-doc-editor p.is-editor-empty:first-child::before {
          content: "${placeholder.replace(/"/g, '\\"')}";
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
        }
        .msc-doc-editor:focus { outline: none; }
        .msc-doc-editor img { max-width: 100%; }
        .msc-doc-editor iframe { width: 100%; aspect-ratio: 16/9; border-radius: 16px; }
      `}</style>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        defaultFolder={uploadFolder}
        onSelect={(r: MediaPickResult) => {
          if (!editor) return
          editor.chain().focus().insertContent(
            `<p><img src="${r.url}" alt="${r.alt.replace(/"/g, '&quot;')}" style="width:${r.width}; height:auto;" /></p>`
          ).run()
        }}
      />
    </div>
  )
}

export default MSCRichEditor
