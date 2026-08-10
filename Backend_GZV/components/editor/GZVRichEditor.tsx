"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Extension } from "@tiptap/core"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import Highlight from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import {
  Bold,
  CaseSensitive,
  Code2,
  Eraser,
  FolderOpen,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Palette,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo2,
  Video,
  Youtube as YoutubeIcon,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { MediaPickerDialog, type MediaPickResult } from "@/components/media/MediaPickerDialog"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  uploadFolder?: string
}

const FONTS = [
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', serif" },
  { label: "Mono", value: "'Roboto Mono', monospace" },
  { label: "Display", value: "'Playfair Display', serif" },
]

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "40px", "56px", "72px"]
const COLORS = ["#050505", "#334155", "#64748b", "#ed1c24", "#c91218", "#f59e0b", "#16a34a", "#ed1c24", "#7c3aed", "#db2777", "#ffffff"]

const TextFormat = Extension.create({
  name: "textFormat",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
          },
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily || null,
            renderHTML: (attributes) => attributes.fontFamily ? { style: `font-family: ${attributes.fontFamily}` } : {},
          },
          textTransform: {
            default: null,
            parseHTML: (element) => element.style.textTransform || null,
            renderHTML: (attributes) => attributes.textTransform ? { style: `text-transform: ${attributes.textTransform}` } : {},
          },
        },
      },
    ]
  },
})

function ToolButton({ onClick, active, disabled, title, children }: any) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        "flex h-9 min-w-9 items-center justify-center gap-1.5 border px-2 text-[12px] font-black uppercase transition",
        active ? "border-[#ed1c24] bg-[#ed1c24] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#ed1c24] hover:text-[#ed1c24]",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="mx-1 h-6 w-px self-center bg-slate-200" />

const editorSelectClass = "h-9 border border-slate-200 bg-white px-2 text-xs font-black uppercase text-slate-700 outline-none transition hover:border-[#ed1c24] focus:border-[#ed1c24]"

const sanitizeUrl = (url: string) => url.trim().replace(/"/g, "&quot;")

const embedHtml = (url: string) => {
  const cleanUrl = sanitizeUrl(url)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(cleanUrl)) {
    return `<figure class="gzv-embed"><video src="${cleanUrl}" controls playsinline style="width:100%;aspect-ratio:16/9;background:#050505;"></video></figure>`
  }
  return `<figure class="gzv-embed"><iframe src="${cleanUrl}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="width:100%;aspect-ratio:16/9;border:0;"></iframe></figure>`
}

export function GZVRichEditor({
  value,
  onChange,
  placeholder = "Bắt đầu viết nội dung...",
  minHeight = 720,
  uploadFolder = "articles",
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: "bg-slate-950 p-4 font-mono text-sm text-slate-100 my-4" } },
        blockquote: { HTMLAttributes: { class: "border-l-4 border-[#ed1c24] pl-4 italic my-4 text-slate-600" } },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      TextFormat,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#ed1c24] underline underline-offset-2", target: "_blank", rel: "noopener noreferrer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "my-6 w-full shadow-lg" },
        allowBase64: false,
      }),
      Youtube.configure({
        width: 960,
        height: 540,
        HTMLAttributes: { class: "my-6 w-full aspect-video" },
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "gzv-doc-editor focus:outline-none prose prose-slate max-w-none " +
          "prose-headings:font-black prose-headings:uppercase prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl " +
          "prose-p:text-[17px] prose-p:leading-8 prose-p:text-slate-800 prose-a:text-[#ed1c24] " +
          "prose-img:rounded-none prose-img:shadow-lg prose-li:marker:text-[#ed1c24]",
        style: `min-height: ${minHeight}px; padding: 56px 72px;`,
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if ((value || "<p></p>") !== current) editor.commands.setContent(value || "<p></p>", { emitUpdate: false })
  }, [value, editor])

  const uploadImage = useCallback(async (file: File) => {
    if (!editor || !file) return
    setUploading(true)
    try {
      const safe = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "")
      const path = `${uploadFolder}/${Date.now()}_${safe}`
      const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path)
      editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run()
      toast({ title: "Đã chèn ảnh" })
    } catch (error: any) {
      toast({ title: "Lỗi tải ảnh", description: error.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }, [editor, uploadFolder])

  const setLink = useCallback(() => {
    if (!editor) return
    const previous = editor.getAttributes("link").href
    const url = window.prompt("Dán đường dẫn liên kết:", previous || "https://")
    if (url === null) return
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run()
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const insertImageUrl = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Dán URL ảnh:")
    if (!url) return
    const alt = window.prompt("Mô tả ảnh:", "") || ""
    editor.chain().focus().setImage({ src: url, alt }).run()
  }, [editor])

  const insertYoutube = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Dán link YouTube:")
    if (!url) return
    editor.commands.setYoutubeVideo({ src: url })
  }, [editor])

  const insertVideoUrl = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Dán URL video mp4/webm/ogg hoặc embed URL:")
    if (!url) return
    editor.chain().focus().insertContent(embedHtml(url)).run()
  }, [editor])

  if (!editor) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-400">
        <Loader2 className="mr-2 animate-spin" size={18} /> Đang khởi tạo trình soạn thảo...
      </div>
    )
  }

  const isHeading = (level: 1 | 2 | 3 | 4) => editor.isActive("heading", { level })
  const textLength = editor.getText().length

  return (
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-1 px-3 py-2">
          <ToolButton title="Hoàn tác" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo2 size={16} /></ToolButton>
          <ToolButton title="Làm lại" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo2 size={16} /></ToolButton>
          <Divider />

          <select
            className={editorSelectClass}
            value={isHeading(1) ? "h1" : isHeading(2) ? "h2" : isHeading(3) ? "h3" : isHeading(4) ? "h4" : "p"}
            onChange={(event) => {
              const value = event.target.value
              const chain = editor.chain().focus()
              if (value === "p") chain.setParagraph().run()
              else chain.toggleHeading({ level: Number(value.replace("h", "")) as 1 | 2 | 3 | 4 }).run()
            }}
          >
            <option value="p">Văn bản</option>
            <option value="h1">Tiêu đề 1</option>
            <option value="h2">Tiêu đề 2</option>
            <option value="h3">Tiêu đề 3</option>
            <option value="h4">Tiêu đề 4</option>
          </select>

          <select
            className={editorSelectClass}
            defaultValue=""
            onChange={(event) => {
              if (!event.target.value) return
              editor.chain().focus().setMark("textStyle", { fontFamily: event.target.value }).run()
            }}
          >
            <option value="" disabled>Font</option>
            {FONTS.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}
          </select>

          <select
            className={editorSelectClass}
            defaultValue=""
            onChange={(event) => {
              if (!event.target.value) return
              editor.chain().focus().setMark("textStyle", { fontSize: event.target.value }).run()
            }}
          >
            <option value="" disabled>Cỡ chữ</option>
            {FONT_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>

          <Divider />
          <ToolButton title="In đậm" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold size={16} /></ToolButton>
          <ToolButton title="In nghiêng" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic size={16} /></ToolButton>
          <ToolButton title="Gạch chân" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineIcon size={16} /></ToolButton>
          <ToolButton title="Gạch ngang" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><Strikethrough size={16} /></ToolButton>
          <ToolButton title="Viết hoa" onClick={() => editor.chain().focus().setMark("textStyle", { textTransform: "uppercase" }).run()}><CaseSensitive size={16} />AA</ToolButton>
          <ToolButton title="Viết thường" onClick={() => editor.chain().focus().setMark("textStyle", { textTransform: "none" }).run()}><CaseSensitive size={16} />aa</ToolButton>

          <div className="group relative">
            <ToolButton title="Màu chữ"><Palette size={16} /></ToolButton>
            <div className="absolute left-0 top-full z-30 mt-1 hidden grid-cols-6 gap-1 border border-slate-200 bg-white p-2 shadow-xl group-hover:grid">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                  className="h-7 w-7 border border-slate-200 transition hover:scale-110"
                  style={{ background: color }}
                />
              ))}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="col-span-6 mt-1 flex items-center justify-center gap-1 py-1 text-[11px] font-black uppercase text-slate-500 hover:text-slate-900"
              >
                <Eraser size={12} /> Bỏ màu
              </button>
            </div>
          </div>

          <ToolButton title="Highlight" onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()} active={editor.isActive("highlight")}><Highlighter size={16} /></ToolButton>

          <Divider />
          <ToolButton title="Danh sách -" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List size={16} /></ToolButton>
          <ToolButton title="Danh sách số" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered size={16} /></ToolButton>
          <ToolButton title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote size={16} /></ToolButton>
          <ToolButton title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}><Code2 size={16} /></ToolButton>
          <ToolButton title="Xuống dòng" onClick={() => editor.chain().focus().setHardBreak().run()}><Pilcrow size={16} />BR</ToolButton>
          <ToolButton title="Đường kẻ ngang" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={16} /></ToolButton>

          <Divider />
          <ToolButton title="Link" onClick={setLink} active={editor.isActive("link")}><Link2 size={16} /></ToolButton>
          <ToolButton title="Upload ảnh" onClick={() => fileRef.current?.click()}>{uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}</ToolButton>
          <ToolButton title="Ảnh từ thư viện" onClick={() => setPickerOpen(true)}><FolderOpen size={16} /></ToolButton>
          <ToolButton title="Ảnh bằng URL" onClick={insertImageUrl}><ImageIcon size={16} />URL</ToolButton>
          <ToolButton title="YouTube" onClick={insertYoutube}><YoutubeIcon size={16} /></ToolButton>
          <ToolButton title="Video URL/embed" onClick={insertVideoUrl}><Video size={16} /></ToolButton>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) uploadImage(file)
              event.target.value = ""
            }}
          />

          <div className="ml-auto flex items-center gap-2 pr-2 text-[11px] font-black uppercase text-slate-400">
            <Type size={12} /> {textLength} ký tự
          </div>
        </div>
      </div>

      <div className="overflow-auto bg-[#f8fafc] px-4 py-8 lg:px-12">
        <div className="mx-auto max-w-[920px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .gzv-doc-editor p.is-editor-empty:first-child::before {
          content: "${placeholder.replace(/"/g, '\\"')}";
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
        }
        .gzv-doc-editor iframe,
        .gzv-doc-editor video {
          width: 100%;
          aspect-ratio: 16 / 9;
          display: block;
          background: #050505;
        }
        .gzv-doc-editor .gzv-embed {
          margin: 24px 0;
        }
        .gzv-doc-editor img {
          max-width: 100%;
          height: auto;
        }
      `}</style>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        defaultFolder={uploadFolder}
        onSelect={(result: MediaPickResult) => {
          if (!editor) return
          if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(result.url)) {
            editor.chain().focus().insertContent(embedHtml(result.url)).run()
          } else {
            editor.chain().focus().insertContent(`<p><img src="${sanitizeUrl(result.url)}" alt="${sanitizeUrl(result.alt)}" style="width:${result.width};height:auto;" /></p>`).run()
          }
        }}
      />
    </div>
  )
}

export default GZVRichEditor
