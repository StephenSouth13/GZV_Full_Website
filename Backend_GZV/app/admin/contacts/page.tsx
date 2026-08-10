"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Mail,
  Inbox,
  Settings2,
  Search,
  Trash2,
  Eye,
  Plus,
  Pencil,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  CheckCircle2,
  Circle,
  Phone,
  AtSign,
  User,
  Calendar,
  Filter,
  Sparkles,
  Clock,
  ShieldAlert,
  CheckCheck,
  MailOpen,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

type FieldType =
  | "text" | "email" | "tel" | "number" | "url"
  | "textarea" | "select" | "radio" | "checkbox" | "date"

interface FormField {
  id: string
  field_key: string
  label: string
  field_type: FieldType
  placeholder?: string | null
  help_text?: string | null
  options: Array<{ label: string; value: string }>
  is_required: boolean
  is_active: boolean
  sort_order: number
  width: "full" | "half"
}

interface Message {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  subject: string | null
  message: string | null
  data: Record<string, any>
  status: string
  is_read: boolean
  admin_note: string | null
  source: string | null
  created_at: string
}

interface ContactSettings {
  id: number
  hero_badge: string
  hero_title: string
  hero_subtitle: string
  form_title: string
  form_description: string
  submit_label: string
  success_message: string
  error_message: string
  info_title: string
  social_title: string
  map_title: string
  map_embed_url?: string | null
  map_enabled: boolean
  contact_items: Array<{ icon?: string; title: string; lines: string[]; href?: string }>
  social_links: Array<{ icon?: string; label: string; href: string; visible?: boolean }>
  stats: Array<{ value: string; label: string }>
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Văn bản ngắn" },
  { value: "textarea", label: "Văn bản dài" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Số điện thoại" },
  { value: "number", label: "Số" },
  { value: "url", label: "Đường dẫn URL" },
  { value: "date", label: "Ngày tháng" },
  { value: "select", label: "Danh sách thả xuống" },
  { value: "radio", label: "Lựa chọn (radio)" },
  { value: "checkbox", label: "Hộp kiểm" },
]

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new: { label: "Mới", cls: "bg-red-50 text-[#ed1c24] border-red-200" },
  in_progress: { label: "Đang xử lý", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  resolved: { label: "Đã xử lý", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  spam: { label: "Spam", cls: "bg-red-100 text-red-700 border-red-200" },
}

const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  id: 1,
  hero_badge: "LIÊN HỆ GZV",
  hero_title: "KẾT NỐI VỚI GZV",
  hero_subtitle: "Để lại thông tin, đội ngũ GZV sẽ phản hồi và đồng hành cùng nhu cầu của bạn.",
  form_title: "Gửi lời nhắn cho chúng tôi",
  form_description: "Điền thông tin bên dưới, đội ngũ GZV sẽ phản hồi trong vòng 24 giờ làm việc.",
  submit_label: "Gửi tin nhắn",
  success_message: "Cảm ơn bạn! Tin nhắn đã được gửi thành công.",
  error_message: "Không gửi được tin nhắn. Vui lòng thử lại sau.",
  info_title: "Thông tin liên hệ",
  social_title: "Mạng xã hội",
  map_title: "Bản đồ GZV",
  map_embed_url: "",
  map_enabled: true,
  contact_items: [
    { icon: "map", title: "Địa chỉ", lines: ["279 Nguyễn Tri Phương, Phường Diên Hồng, TP. Hồ Chí Minh"] },
    { icon: "phone", title: "Điện thoại", lines: ["(+84) 329 381 489"], href: "tel:+84329381489" },
    { icon: "mail", title: "Email", lines: ["gzv.one@gmail.com"], href: "mailto:gzv.one@gmail.com" },
  ],
  social_links: [
    { icon: "facebook", label: "Facebook", href: "https://www.facebook.com/gzv.one", visible: true },
    { icon: "zalo", label: "Zalo", href: "https://zalo.me/g/acumou501", visible: true },
  ],
  stats: [
    { value: "+84", label: "Điện thoại" },
    { value: "24h", label: "Phản hồi" },
    { value: "100%", label: "Tin cậy" },
  ],
}

export default function AdminContactsPage() {
  const [tab, setTab] = useState("messages")
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Mail className="h-7 w-7 text-[#ed1c24]" /> Tin nhắn liên hệ
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý tin nhắn người dùng gửi từ trang <span className="font-mono">/lien-he</span> và cấu hình các trường biểu mẫu.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 rounded-none">
          <TabsTrigger value="messages" className="gap-2"><Inbox className="h-4 w-4" /> Hộp thư đến</TabsTrigger>
          <TabsTrigger value="fields" className="gap-2"><Settings2 className="h-4 w-4" /> Cấu hình biểu mẫu</TabsTrigger>
          <TabsTrigger value="page" className="gap-2"><Pencil className="h-4 w-4" /> Trang liên hệ</TabsTrigger>
        </TabsList>

        <TabsContent value="messages"><MessagesPanel /></TabsContent>
        <TabsContent value="fields"><FieldsPanel /></TabsContent>
        <TabsContent value="page"><ContactPageSettingsPanel /></TabsContent>
      </Tabs>
    </div>
  )
}

/* ============================================================
   MESSAGES PANEL
============================================================ */
function MessagesPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selected, setSelected] = useState<Message | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } else {
      setMessages((data || []) as any)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return messages.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false
      if (!q) return true
      return [m.name, m.email, m.phone, m.subject, m.message]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    })
  }, [messages, search, statusFilter])

  const counts = useMemo(() => ({
    total: messages.length,
    unread: messages.filter((m) => !m.is_read).length,
    today: messages.filter((m) => new Date(m.created_at).toDateString() === new Date().toDateString()).length,
    new: messages.filter((m) => m.status === "new").length,
    in_progress: messages.filter((m) => m.status === "in_progress").length,
    resolved: messages.filter((m) => m.status === "resolved").length,
    spam: messages.filter((m) => m.status === "spam").length,
  }), [messages])

  const markRead = async (m: Message, read: boolean) => {
    const { error } = await supabase.from("contact_messages").update({ is_read: read }).eq("id", m.id)
    if (!error) setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, is_read: read } : x))
  }

  const updateStatus = async (m: Message, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", m.id)
    if (!error) {
      setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, status } : x))
      if (selected?.id === m.id) setSelected({ ...m, status })
      toast({ title: "Đã cập nhật trạng thái", description: STATUS_LABELS[status]?.label || status })
    }
  }

  const saveNote = async (m: Message, note: string) => {
    const { error } = await supabase.from("contact_messages").update({ admin_note: note }).eq("id", m.id)
    if (!error) {
      setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, admin_note: note } : x))
      toast({ title: "Đã lưu ghi chú" })
    }
  }

  const remove = async (m: Message) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", m.id)
    if (error) {
      toast({ title: "Lỗi xóa", description: error.message, variant: "destructive" })
    } else {
      setMessages((prev) => prev.filter((x) => x.id !== m.id))
      if (selected?.id === m.id) setSelected(null)
      toast({ title: "Đã xóa tin nhắn" })
    }
  }

  return (
    <div className="space-y-4">
      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard icon={<Inbox className="h-5 w-5" />} label="Tổng tin nhắn" value={counts.total} color="from-slate-600 to-slate-800" />
        <StatCard icon={<Circle className="h-5 w-5" />} label="Chưa đọc" value={counts.unread} color="from-amber-500 to-orange-500" />
        <StatCard icon={<Calendar className="h-5 w-5" />} label="Hôm nay" value={counts.today} color="from-emerald-500 to-teal-500" />
      </div>

      {/* Status filter pills */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <StatusPill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}
          icon={<Inbox className="h-4 w-4" />} label="Tất cả" value={counts.total}
          activeCls="bg-gray-900 text-white border-gray-900" />
        <StatusPill active={statusFilter === "new"} onClick={() => setStatusFilter("new")}
          icon={<Sparkles className="h-4 w-4" />} label="Mới" value={counts.new}
          activeCls="bg-[#ed1c24] text-white border-[#ed1c24]" />
        <StatusPill active={statusFilter === "in_progress"} onClick={() => setStatusFilter("in_progress")}
          icon={<Clock className="h-4 w-4" />} label="Đang xử lý" value={counts.in_progress}
          activeCls="bg-amber-500 text-white border-amber-500" />
        <StatusPill active={statusFilter === "resolved"} onClick={() => setStatusFilter("resolved")}
          icon={<CheckCheck className="h-4 w-4" />} label="Đã xử lý" value={counts.resolved}
          activeCls="bg-emerald-600 text-white border-emerald-600" />
        <StatusPill active={statusFilter === "spam"} onClick={() => setStatusFilter("spam")}
          icon={<ShieldAlert className="h-4 w-4" />} label="Spam" value={counts.spam}
          activeCls="bg-red-600 text-white border-red-600" />
      </div>


      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-9" placeholder="Tìm theo tên, email, nội dung..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={load} title="Tải lại">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <Mail className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p>Chưa có tin nhắn nào.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((m) => {
                const st = STATUS_LABELS[m.status] || STATUS_LABELS.new
                return (
                  <li key={m.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition ${!m.is_read ? "bg-red-50/40" : ""}`}
                    onClick={() => { setSelected(m); if (!m.is_read) markRead(m, true) }}>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ed1c24] to-[#050505] flex items-center justify-center text-white font-semibold shrink-0">
                        {(m.name || m.email || "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold ${!m.is_read ? "text-gray-900" : "text-gray-700"}`}>
                            {m.name || "Khách ẩn danh"}
                          </span>
                          {m.email && <span className="text-xs text-gray-500">· {m.email}</span>}
                          <Badge variant="outline" className={st.cls}>{st.label}</Badge>
                          {!m.is_read && <span className="h-2 w-2 rounded-full bg-[#ed1c24]" />}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.message || "(Không có nội dung)"}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(m.created_at).toLocaleString("vi-VN")}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" title={m.is_read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                          onClick={() => markRead(m, !m.is_read)}>
                          {m.is_read ? <Circle className="h-4 w-4 text-gray-500" /> : <MailOpen className="h-4 w-4 text-[#ed1c24]" />}
                        </Button>
                        <Button variant="ghost" size="icon" title="Đánh dấu đã xử lý"
                          onClick={() => updateStatus(m, "resolved")}
                          disabled={m.status === "resolved"}>
                          <CheckCheck className={`h-4 w-4 ${m.status === "resolved" ? "text-emerald-300" : "text-emerald-600"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" title="Đánh dấu spam"
                          onClick={() => updateStatus(m, "spam")}
                          disabled={m.status === "spam"}>
                          <ShieldAlert className={`h-4 w-4 ${m.status === "spam" ? "text-red-300" : "text-red-600"}`} />
                        </Button>
                        <Button variant="ghost" size="icon" title="Xem chi tiết" onClick={() => setSelected(m)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Xóa">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa tin nhắn này?</AlertDialogTitle>
                              <AlertDialogDescription>Hành động không thể hoàn tác.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(m)} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <MessageDetailDialog
        message={selected}
        onClose={() => setSelected(null)}
        onStatusChange={updateStatus}
        onSaveNote={saveNote}
        onToggleRead={markRead}
      />
    </div>
  )
}

function StatusPill({ active, onClick, icon, label, value, activeCls }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; value: number; activeCls: string
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition shadow-sm
        ${active ? activeCls : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
      <span className="flex items-center gap-2 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${active ? "bg-white/20" : "bg-gray-100 text-gray-700"}`}>
        {value}
      </span>
    </button>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm/none opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">{icon}</div>
      </div>
    </div>
  )
}

function MessageDetailDialog({
  message, onClose, onStatusChange, onSaveNote, onToggleRead,
}: {
  message: Message | null
  onClose: () => void
  onStatusChange: (m: Message, s: string) => void
  onSaveNote: (m: Message, n: string) => void
  onToggleRead: (m: Message, r: boolean) => void
}) {
  const [note, setNote] = useState("")
  useEffect(() => { setNote(message?.admin_note || "") }, [message?.id])

  if (!message) return null
  const st = STATUS_LABELS[message.status] || STATUS_LABELS.new
  const extra = Object.entries(message.data || {}).filter(([_, v]) => v !== null && v !== "" && v !== undefined)

  return (
    <Dialog open={!!message} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#ed1c24]" /> Chi tiết tin nhắn
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ed1c24] to-[#050505] flex items-center justify-center text-white font-bold">
              {(message.name || message.email || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{message.name || "Khách ẩn danh"}</p>
              <p className="text-xs text-gray-500">{new Date(message.created_at).toLocaleString("vi-VN")}</p>
            </div>
            <Badge variant="outline" className={st.cls}>{st.label}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {message.email && <InfoRow icon={<AtSign className="h-4 w-4" />} label="Email" value={message.email} link={`mailto:${message.email}`} />}
            {message.phone && <InfoRow icon={<Phone className="h-4 w-4" />} label="Điện thoại" value={message.phone} link={`tel:${message.phone}`} />}
            {message.subject && <InfoRow icon={<User className="h-4 w-4" />} label="Chủ đề" value={message.subject} />}
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-gray-500">Nội dung</Label>
            <div className="mt-2 rounded-xl border bg-gray-50 p-4 whitespace-pre-wrap text-gray-800">
              {message.message || "(Không có nội dung)"}
            </div>
          </div>

          {extra.length > 0 && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-gray-500">Trường tùy chỉnh</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extra.map(([k, v]) => (
                  <div key={k} className="rounded-lg border bg-white p-3 text-sm">
                    <p className="text-xs text-gray-500">{k}</p>
                    <p className="font-medium text-gray-800 break-words">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Trạng thái</Label>
              <Select value={message.status} onValueChange={(v) => onStatusChange(message, v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full gap-2"
                onClick={() => onToggleRead(message, !message.is_read)}>
                {message.is_read ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {message.is_read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
              </Button>
            </div>
          </div>

          <div>
            <Label>Ghi chú nội bộ</Label>
            <Textarea className="mt-1" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Thêm ghi chú cho đồng đội..." />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={() => onSaveNote(message, note)}>Lưu ghi chú</Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: string }) {
  return (
    <div className="rounded-lg border bg-white p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-red-50 text-[#ed1c24] flex items-center justify-center">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        {link ? (
          <a href={link} className="font-medium text-gray-800 hover:text-[#ed1c24] truncate block">{value}</a>
        ) : (
          <p className="font-medium text-gray-800 truncate">{value}</p>
        )}
      </div>
    </div>
  )
}

/* ============================================================
   FIELDS PANEL
============================================================ */
function FieldsPanel() {
  const [fields, setFields] = useState<FormField[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<FormField | null>(null)
  const [open, setOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("contact_form_fields")
      .select("*")
      .order("sort_order", { ascending: true })
    if (error) toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    else {
      setFields((data || []).map((d: any) => ({
        ...d,
        options: Array.isArray(d.options)
          ? d.options.map((o: any) => typeof o === "string" ? { label: o, value: o } : o)
          : [],
        width: d.width === "half" ? "half" : "full",
      })))
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing({
      id: "",
      field_key: "",
      label: "",
      field_type: "text",
      placeholder: "",
      help_text: "",
      options: [],
      is_required: false,
      is_active: true,
      sort_order: (fields[fields.length - 1]?.sort_order ?? 0) + 1,
      width: "full",
    })
    setOpen(true)
  }

  const openEdit = (f: FormField) => { setEditing({ ...f }); setOpen(true) }

  const remove = async (f: FormField) => {
    const { error } = await supabase.from("contact_form_fields").delete().eq("id", f.id)
    if (error) toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    else {
      setFields((prev) => prev.filter((x) => x.id !== f.id))
      toast({ title: "Đã xóa trường" })
    }
  }

  const toggleActive = async (f: FormField) => {
    const { error } = await supabase.from("contact_form_fields")
      .update({ is_active: !f.is_active }).eq("id", f.id)
    if (!error) setFields((prev) => prev.map((x) => x.id === f.id ? { ...x, is_active: !f.is_active } : x))
  }

  const move = async (f: FormField, dir: -1 | 1) => {
    const idx = fields.findIndex((x) => x.id === f.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= fields.length) return
    const a = fields[idx], b = fields[swapIdx]
    await supabase.from("contact_form_fields").update({ sort_order: b.sort_order }).eq("id", a.id)
    await supabase.from("contact_form_fields").update({ sort_order: a.sort_order }).eq("id", b.id)
    load()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Trường biểu mẫu liên hệ</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Cấu hình các trường hiển thị ở trang <span className="font-mono">/lien-he</span>. Hỗ trợ nhiều kiểu dữ liệu: văn bản, email, select, radio, checkbox...</p>
          </div>
          <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Thêm trường</Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Đang tải...</div>
          ) : fields.length === 0 ? (
            <div className="p-10 text-center text-gray-500">Chưa có trường nào.</div>
          ) : (
            <ul className="divide-y">
              {fields.map((f, i) => (
                <li key={f.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                  <div className="flex flex-col">
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === 0} onClick={() => move(f, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={i === fields.length - 1} onClick={() => move(f, 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{f.label}</span>
                      <code className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{f.field_key}</code>
                      <Badge variant="outline">{FIELD_TYPES.find(t => t.value === f.field_type)?.label || f.field_type}</Badge>
                      {f.is_required && <Badge className="bg-red-100 text-red-700 border-red-200" variant="outline">Bắt buộc</Badge>}
                      <Badge variant="outline" className="bg-gray-50">{f.width === "half" ? "1/2 hàng" : "Full hàng"}</Badge>
                    </div>
                    {f.placeholder && <p className="text-xs text-gray-500 mt-1">Placeholder: {f.placeholder}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={f.is_active} onCheckedChange={() => toggleActive(f)} />
                      <span className="text-xs text-gray-500">{f.is_active ? "Bật" : "Tắt"}</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => openEdit(f)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa trường "{f.label}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Trường sẽ không còn hiển thị trên trang liên hệ. Hành động không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(f)} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <FieldEditorDialog
        open={open}
        onOpenChange={setOpen}
        field={editing}
        onSaved={load}
      />
    </div>
  )
}

function ContactPageSettingsPanel() {
  const [settings, setSettings] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("site_contact_settings").select("*").eq("id", 1).maybeSingle()
    if (error) toast({ title: "Lỗi tải cấu hình trang liên hệ", description: error.message, variant: "destructive" })
    else setSettings({ ...DEFAULT_CONTACT_SETTINGS, ...(data || {}) } as ContactSettings)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    const payload = { ...settings, id: 1 }
    const { error } = await supabase.from("site_contact_settings").upsert(payload, { onConflict: "id" })
    setSaving(false)
    if (error) toast({ title: "Không lưu được trang liên hệ", description: error.message, variant: "destructive" })
    else toast({ title: "Đã lưu trang liên hệ" })
  }

  const updateItem = (index: number, patch: Partial<ContactSettings["contact_items"][number]>) => {
    setSettings((value) => ({
      ...value,
      contact_items: value.contact_items.map((item, idx) => idx === index ? { ...item, ...patch } : item),
    }))
  }
  const updateSocial = (index: number, patch: Partial<ContactSettings["social_links"][number]>) => {
    setSettings((value) => ({
      ...value,
      social_links: value.social_links.map((item, idx) => idx === index ? { ...item, ...patch } : item),
    }))
  }
  const updateStat = (index: number, patch: Partial<ContactSettings["stats"][number]>) => {
    setSettings((value) => ({
      ...value,
      stats: value.stats.map((item, idx) => idx === index ? { ...item, ...patch } : item),
    }))
  }

  if (loading) return <div className="border bg-white p-10 text-center text-gray-500">Đang tải cấu hình trang liên hệ...</div>

  return (
    <div className="space-y-5">
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Hero và form</CardTitle>
          <p className="text-sm text-gray-500">Chỉnh tiêu đề banner, mô tả form, nút gửi và thông báo sau khi gửi.</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <AdminField label="Badge banner"><Input value={settings.hero_badge} onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })} /></AdminField>
          <AdminField label="Tiêu đề banner"><Input value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} /></AdminField>
          <div className="md:col-span-2"><AdminField label="Mô tả banner"><Textarea value={settings.hero_subtitle} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} /></AdminField></div>
          <AdminField label="Tiêu đề form"><Input value={settings.form_title} onChange={(e) => setSettings({ ...settings, form_title: e.target.value })} /></AdminField>
          <AdminField label="Nút gửi"><Input value={settings.submit_label} onChange={(e) => setSettings({ ...settings, submit_label: e.target.value })} /></AdminField>
          <div className="md:col-span-2"><AdminField label="Mô tả form"><Textarea value={settings.form_description} onChange={(e) => setSettings({ ...settings, form_description: e.target.value })} /></AdminField></div>
          <AdminField label="Thông báo thành công"><Input value={settings.success_message} onChange={(e) => setSettings({ ...settings, success_message: e.target.value })} /></AdminField>
          <AdminField label="Thông báo lỗi"><Input value={settings.error_message} onChange={(e) => setSettings({ ...settings, error_message: e.target.value })} /></AdminField>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Thông tin liên hệ</CardTitle>
          <p className="text-sm text-gray-500">Mỗi dòng hỗ trợ icon: map, phone, mail, clock.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <AdminField label="Tiêu đề khối"><Input value={settings.info_title} onChange={(e) => setSettings({ ...settings, info_title: e.target.value })} /></AdminField>
          {settings.contact_items.map((item, index) => (
            <div key={index} className="grid gap-3 border p-3 md:grid-cols-[0.6fr_1fr_1.4fr_1fr_auto]">
              <Input value={item.icon || ""} onChange={(e) => updateItem(index, { icon: e.target.value })} placeholder="icon" />
              <Input value={item.title || ""} onChange={(e) => updateItem(index, { title: e.target.value })} placeholder="Tiêu đề" />
              <Textarea value={(item.lines || []).join("\n")} onChange={(e) => updateItem(index, { lines: e.target.value.split("\n").filter(Boolean) })} placeholder="Mỗi dòng một ý" />
              <Input value={item.href || ""} onChange={(e) => updateItem(index, { href: e.target.value })} placeholder="tel:, mailto:, https://" />
              <Button variant="destructive" size="icon" className="rounded-none" onClick={() => setSettings({ ...settings, contact_items: settings.contact_items.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" className="rounded-none" onClick={() => setSettings({ ...settings, contact_items: [...settings.contact_items, { icon: "map", title: "Thông tin mới", lines: ["Nội dung"], href: "" }] })}><Plus className="mr-2 h-4 w-4" /> Thêm thông tin</Button>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-none">
          <CardHeader><CardTitle>Social</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <AdminField label="Tiêu đề social"><Input value={settings.social_title} onChange={(e) => setSettings({ ...settings, social_title: e.target.value })} /></AdminField>
            {settings.social_links.map((item, index) => (
              <div key={index} className="grid gap-2 border p-3 md:grid-cols-[0.8fr_1fr_1.5fr_auto_auto]">
                <Input value={item.icon || ""} onChange={(e) => updateSocial(index, { icon: e.target.value })} placeholder="icon" />
                <Input value={item.label || ""} onChange={(e) => updateSocial(index, { label: e.target.value })} placeholder="Label" />
                <Input value={item.href || ""} onChange={(e) => updateSocial(index, { href: e.target.value })} placeholder="URL" />
                <Switch checked={item.visible !== false} onCheckedChange={(visible) => updateSocial(index, { visible })} />
                <Button variant="destructive" size="icon" className="rounded-none" onClick={() => setSettings({ ...settings, social_links: settings.social_links.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" className="rounded-none" onClick={() => setSettings({ ...settings, social_links: [...settings.social_links, { icon: "message", label: "Social mới", href: "", visible: true }] })}><Plus className="mr-2 h-4 w-4" /> Thêm social</Button>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader><CardTitle>Stats banner</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {settings.stats.map((item, index) => (
              <div key={index} className="grid gap-2 border p-3 md:grid-cols-[1fr_1fr_auto]">
                <Input value={item.value} onChange={(e) => updateStat(index, { value: e.target.value })} placeholder="10+" />
                <Input value={item.label} onChange={(e) => updateStat(index, { label: e.target.value })} placeholder="Nhãn" />
                <Button variant="destructive" size="icon" className="rounded-none" onClick={() => setSettings({ ...settings, stats: settings.stats.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" className="rounded-none" onClick={() => setSettings({ ...settings, stats: [...settings.stats, { value: "10+", label: "Chỉ số" }] })}><Plus className="mr-2 h-4 w-4" /> Thêm stat</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader><CardTitle>Google Map</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Tiêu đề map"><Input value={settings.map_title} onChange={(e) => setSettings({ ...settings, map_title: e.target.value })} /></AdminField>
            <div className="flex items-end justify-between border px-4 py-3"><Label>Bật bản đồ</Label><Switch checked={settings.map_enabled} onCheckedChange={(map_enabled) => setSettings({ ...settings, map_enabled })} /></div>
          </div>
          <AdminField label="Google Map embed URL"><Textarea rows={4} value={settings.map_embed_url || ""} onChange={(e) => setSettings({ ...settings, map_embed_url: e.target.value })} placeholder="Dán URL trong src của iframe Google Maps" /></AdminField>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end border bg-white/95 p-3 shadow-xl backdrop-blur">
        <Button onClick={save} disabled={saving} className="rounded-none bg-[#ed1c24] px-8 font-black uppercase hover:bg-[#c91218]">{saving ? "Đang lưu..." : "Lưu trang liên hệ"}</Button>
      </div>
    </div>
  )
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-xs font-black uppercase tracking-wide text-slate-600">{label}</Label>{children}</div>
}

function FieldEditorDialog({
  open, onOpenChange, field, onSaved,
}: {
  open: boolean
  onOpenChange: (b: boolean) => void
  field: FormField | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormField | null>(field)
  const [optionsText, setOptionsText] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(field)
    setOptionsText(
      field?.options?.map((o) => o.label === o.value ? o.value : `${o.label}|${o.value}`).join("\n") || ""
    )
  }, [field])

  if (!form) return null

  const needsOptions = ["select", "radio"].includes(form.field_type)

  const save = async () => {
    if (!form.label.trim()) {
      toast({ title: "Vui lòng nhập nhãn", variant: "destructive" }); return
    }
    if (!form.field_key.trim()) {
      toast({ title: "Vui lòng nhập field_key", variant: "destructive" }); return
    }
    setSaving(true)
    const options = needsOptions
      ? optionsText.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
          const [label, value] = l.split("|").map((s) => s.trim())
          return { label, value: value || label }
        })
      : []

    const payload: any = {
      field_key: form.field_key.trim(),
      label: form.label.trim(),
      field_type: form.field_type,
      placeholder: form.placeholder || null,
      help_text: form.help_text || null,
      options,
      is_required: form.is_required,
      is_active: form.is_active,
      sort_order: form.sort_order,
      width: form.width,
    }

    const { error } = form.id
      ? await supabase.from("contact_form_fields").update(payload).eq("id", form.id)
      : await supabase.from("contact_form_fields").insert(payload)

    setSaving(false)
    if (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" })
    } else {
      toast({ title: form.id ? "Đã cập nhật trường" : "Đã thêm trường" })
      onOpenChange(false)
      onSaved()
    }
  }

  const upd = (patch: Partial<FormField>) => setForm({ ...form, ...patch })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{form.id ? "Sửa trường" : "Thêm trường mới"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nhãn hiển thị *</Label>
              <Input value={form.label} onChange={(e) => upd({ label: e.target.value })} placeholder="Ví dụ: Họ và tên" />
            </div>
            <div>
              <Label>Mã định danh (field_key) *</Label>
              <Input value={form.field_key}
                onChange={(e) => upd({ field_key: e.target.value.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() })}
                placeholder="full_name" />
              <p className="text-xs text-gray-500 mt-1">Chỉ chữ thường, số, _ (vd: full_name)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Kiểu dữ liệu</Label>
              <Select value={form.field_type} onValueChange={(v: FieldType) => upd({ field_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Chiều rộng</Label>
              <Select value={form.width} onValueChange={(v: "full" | "half") => upd({ width: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full hàng</SelectItem>
                  <SelectItem value="half">1/2 hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Placeholder</Label>
            <Input value={form.placeholder || ""} onChange={(e) => upd({ placeholder: e.target.value })} />
          </div>

          <div>
            <Label>Mô tả phụ (help text)</Label>
            <Input value={form.help_text || ""} onChange={(e) => upd({ help_text: e.target.value })} />
          </div>

          {needsOptions && (
            <div>
              <Label>Tùy chọn (mỗi dòng 1 mục, có thể dùng <code>nhãn|giá_trị</code>)</Label>
              <Textarea rows={5} value={optionsText} onChange={(e) => setOptionsText(e.target.value)}
                placeholder={"Tư vấn khóa học\nHợp tác doanh nghiệp|partnership\nKhác|other"} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Thứ tự</Label>
              <Input type="number" value={form.sort_order}
                onChange={(e) => upd({ sort_order: Number(e.target.value) || 0 })} />
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <span className="text-sm">Bắt buộc</span>
                <Switch checked={form.is_required} onCheckedChange={(v) => upd({ is_required: v })} />
              </div>
              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <span className="text-sm">Đang bật</span>
                <Switch checked={form.is_active} onCheckedChange={(v) => upd({ is_active: v })} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
