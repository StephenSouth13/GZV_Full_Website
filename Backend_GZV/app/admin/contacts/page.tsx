"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
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
  Calendar,
  Sparkles,
  Clock,
  ShieldAlert,
  CheckCheck,
  MailOpen,
  MessageSquare,
  Save,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "url"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"

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

const STATUS_LABELS: Record<string, { label: string; cls: string; dot: string }> = {
  new: { label: "Mới", cls: "bg-red-50 text-[#ed1c24] border-red-200 dark:bg-red-950/40 dark:border-red-800", dot: "bg-[#ed1c24]" },
  in_progress: { label: "Đang xử lý", cls: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800", dot: "bg-amber-500" },
  resolved: { label: "Đã xử lý", cls: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800", dot: "bg-emerald-500" },
  spam: { label: "Spam", cls: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-white/10", dot: "bg-slate-400" },
}

export default function AdminContactsPage() {
  const [tab, setTab] = useState("messages")

  return (
    <div className="mx-auto max-w-6xl space-y-6 select-none p-1.5 md:p-0">
      {/* Top Header Card */}
      <div className="relative overflow-hidden border border-slate-200 bg-white p-5 md:p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ed1c24] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#ed1c24] text-white shadow-xs">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ed1c24] block leading-tight">
                CONTACTS & INBOX
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Hộp Thư Liên Hệ & Cấu Hình Biểu Mẫu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Quản lý tin nhắn khách hàng gửi từ /lien-he và cấu hình các trường nhập biểu mẫu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6 w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 border border-slate-200 bg-slate-100 p-1.5 rounded-none shadow-xs dark:border-white/10 dark:bg-slate-900">
          <TabsTrigger
            value="messages"
            className="rounded-none py-2.5 px-2 text-xs font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-2"
          >
            <Inbox className="h-4 w-4 shrink-0" />
            <span>Hộp Thư Đến</span>
          </TabsTrigger>
          <TabsTrigger
            value="fields"
            className="rounded-none py-2.5 px-2 text-xs font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#ed1c24] data-[state=active]:text-white data-[state=active]:shadow-xs flex items-center justify-center gap-2"
          >
            <Settings2 className="h-4 w-4 shrink-0" />
            <span>Cấu Hình Biểu Mẫu</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4 w-full">
          <MessagesPanel />
        </TabsContent>
        <TabsContent value="fields" className="space-y-4 w-full">
          <FieldsPanel />
        </TabsContent>
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
      toast({ title: "Lỗi tải tin nhắn", description: error.message, variant: "destructive" })
    } else {
      setMessages((data || []) as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

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

  const counts = useMemo(
    () => ({
      total: messages.length,
      unread: messages.filter((m) => !m.is_read).length,
      today: messages.filter(
        (m) => new Date(m.created_at).toDateString() === new Date().toDateString()
      ).length,
      new: messages.filter((m) => m.status === "new").length,
      in_progress: messages.filter((m) => m.status === "in_progress").length,
      resolved: messages.filter((m) => m.status === "resolved").length,
      spam: messages.filter((m) => m.status === "spam").length,
    }),
    [messages]
  )

  const markRead = async (m: Message, read: boolean) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: read })
      .eq("id", m.id)
    if (!error) {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: read } : x)))
      if (selected?.id === m.id) setSelected({ ...selected, is_read: read })
    }
  }

  const updateStatus = async (m: Message, status: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", m.id)
    if (!error) {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status } : x)))
      if (selected?.id === m.id) setSelected({ ...selected, status })
      toast({
        title: "Đã cập nhật trạng thái",
        description: STATUS_LABELS[status]?.label || status,
      })
    }
  }

  const saveNote = async (m: Message, note: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ admin_note: note })
      .eq("id", m.id)
    if (!error) {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, admin_note: note } : x)))
      if (selected?.id === m.id) setSelected({ ...selected, admin_note: note })
      toast({ title: "Đã lưu ghi chú thành công" })
    }
  }

  const remove = async (m: Message) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", m.id)
    if (error) {
      toast({ title: "Lỗi xóa tin nhắn", description: error.message, variant: "destructive" })
    } else {
      setMessages((prev) => prev.filter((x) => x.id !== m.id))
      if (selected?.id === m.id) setSelected(null)
      toast({ title: "Đã xóa tin nhắn thành công" })
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* 3 Stats Overview Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tổng Số Tin Nhắn</p>
          <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{counts.total}</p>
        </div>

        <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tin Chưa Đọc</p>
          <p className="mt-2 text-2xl font-black text-[#ed1c24]">{counts.unread}</p>
        </div>

        <div className="border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Tin Nhận Hôm Nay</p>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">{counts.today}</p>
        </div>
      </div>

      {/* Filter Tabs / Status Pills */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 w-full">
        {[
          { key: "all", label: "Tất cả", count: counts.total, icon: Inbox },
          { key: "new", label: "Tin mới", count: counts.new, icon: Sparkles },
          { key: "in_progress", label: "Đang xử lý", count: counts.in_progress, icon: Clock },
          { key: "resolved", label: "Đã xử lý", count: counts.resolved, icon: CheckCheck },
          { key: "spam", label: "Spam", count: counts.spam, icon: ShieldAlert },
        ].map((tabItem) => {
          const isSelected = statusFilter === tabItem.key
          const Icon = tabItem.icon

          return (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setStatusFilter(tabItem.key)}
              className={`flex items-center justify-between p-2.5 transition-all text-left border cursor-pointer ${
                isSelected
                  ? "border-[#ed1c24] bg-[#ed1c24] text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-white" : "text-slate-500"}`} />
                <span className="text-xs font-black uppercase tracking-wide truncate">
                  {tabItem.label}
                </span>
              </div>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {tabItem.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Toolbar & Large Refresh Button */}
      <div className="border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-white/10 dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-3 w-full">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, email, số điện thoại, tiêu đề..."
            className="h-11 rounded-none border-slate-200 bg-slate-50/70 pl-10 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              Xóa
            </button>
          )}
        </div>

        <Button
          variant="outline"
          size="default"
          onClick={load}
          disabled={loading}
          className="h-11 px-6 rounded-none border-slate-200 bg-white text-xs font-black uppercase tracking-wider text-slate-800 hover:border-[#ed1c24] hover:text-[#ed1c24] dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 shrink-0 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`mr-2 h-4 w-4 text-[#ed1c24] ${loading ? "animate-spin" : ""}`} />
          LÀM MỚI
        </Button>
      </div>

      {/* Messages List Card */}
      <div className="border border-slate-200 bg-white shadow-2xs dark:border-white/10 dark:bg-slate-900 overflow-hidden w-full">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#ed1c24] mb-2" />
            Đang tải dữ liệu hộp thư...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Mail className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Không có tin nhắn nào phù hợp.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((m) => {
              const st = STATUS_LABELS[m.status] || STATUS_LABELS.new
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelected(m)
                    if (!m.is_read) markRead(m, true)
                  }}
                  className={`p-4 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                    !m.is_read
                      ? "bg-red-50/30 dark:bg-red-950/10 border-l-3 border-l-[#ed1c24]"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* User initial avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#ed1c24] text-white font-black text-xs shadow-xs">
                      {(m.name || m.email || "G").slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-black uppercase tracking-tight ${
                            !m.is_read
                              ? "text-slate-950 dark:text-white font-extrabold"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {m.name || "Khách liên hệ ẩn danh"}
                        </span>

                        {m.email && (
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            &lt;{m.email}&gt;
                          </span>
                        )}

                        <Badge
                          variant="outline"
                          className={`rounded-none text-[10px] font-bold uppercase py-0.5 px-2 ${st.cls}`}
                        >
                          {st.label}
                        </Badge>

                        {!m.is_read && (
                          <span className="h-2 w-2 rounded-full bg-[#ed1c24] inline-block" />
                        )}
                      </div>

                      {m.subject && (
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 truncate">
                          Chủ đề: {m.subject}
                        </p>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {m.message || "(Không có nội dung tin nhắn)"}
                      </p>

                      <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 mt-1">
                        <span>{new Date(m.created_at).toLocaleString("vi-VN")}</span>
                        {m.phone && <span>· SĐT: {m.phone}</span>}
                        {m.admin_note && (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            · Có ghi chú nội bộ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div
                    className="flex items-center gap-1 shrink-0 self-end sm:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      title={m.is_read ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
                      onClick={() => markRead(m, !m.is_read)}
                    >
                      {m.is_read ? (
                        <Circle className="h-4 w-4 text-slate-400" />
                      ) : (
                        <MailOpen className="h-4 w-4 text-[#ed1c24]" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none text-slate-500 hover:text-emerald-600"
                      title="Đánh dấu đã xử lý"
                      onClick={() => updateStatus(m, "resolved")}
                      disabled={m.status === "resolved"}
                    >
                      <CheckCheck
                        className={`h-4 w-4 ${
                          m.status === "resolved" ? "text-emerald-300" : "text-emerald-600"
                        }`}
                      />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none text-slate-500 hover:text-[#ed1c24]"
                      title="Xem chi tiết"
                      onClick={() => setSelected(m)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none text-slate-400 hover:text-red-600"
                          title="Xóa tin nhắn"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-none border border-slate-200 bg-white p-0 dark:border-white/10 dark:bg-slate-900 overflow-hidden shadow-2xl">
                        <div className="h-1 w-full bg-[#ed1c24]" />
                        <div className="p-6">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-black uppercase text-slate-900 dark:text-white">
                              Xóa tin nhắn này?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                              Dữ liệu tin nhắn của{" "}
                              <span className="font-bold text-slate-900 dark:text-white">
                                {m.name || m.email}
                              </span>{" "}
                              sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                        </div>
                        <AlertDialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-white/10 dark:bg-slate-950">
                          <AlertDialogCancel className="h-8.5 rounded-none text-xs font-black uppercase">
                            Hủy
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => remove(m)}
                            className="h-8.5 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
                          >
                            Xác nhận xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
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

function MessageDetailDialog({
  message,
  onClose,
  onStatusChange,
  onSaveNote,
  onToggleRead,
}: {
  message: Message | null
  onClose: () => void
  onStatusChange: (m: Message, s: string) => void
  onSaveNote: (m: Message, n: string) => void
  onToggleRead: (m: Message, r: boolean) => void
}) {
  const [note, setNote] = useState("")
  useEffect(() => {
    setNote(message?.admin_note || "")
  }, [message?.id, message?.admin_note])

  if (!message) return null
  const st = STATUS_LABELS[message.status] || STATUS_LABELS.new
  const extra = Object.entries(message.data || {}).filter(
    ([_, v]) => v !== null && v !== "" && v !== undefined
  )

  return (
    <Dialog open={!!message} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl rounded-none border border-slate-200 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden select-none max-h-[90vh] overflow-y-auto">
        <div className="h-1 w-full bg-[#ed1c24]" />

        {/* Dialog Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#ed1c24] text-white shadow-xs">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-[#ed1c24] leading-tight">
                CHI TIẾT TIN NHẮN LIÊN HỆ
              </span>
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                {message.name || "Khách liên hệ ẩn danh"}
              </DialogTitle>
            </div>
          </div>
          <Badge variant="outline" className={`rounded-none text-xs font-bold uppercase ${st.cls}`}>
            {st.label}
          </Badge>
        </div>

        {/* Dialog Body */}
        <div className="p-6 space-y-5">
          {/* Info Rows */}
          <div className="grid gap-3 sm:grid-cols-2">
            {message.email && (
              <div className="border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-slate-950 flex items-center gap-2.5">
                <AtSign className="h-4 w-4 text-[#ed1c24] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-500">Email</p>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#ed1c24] truncate block"
                  >
                    {message.email}
                  </a>
                </div>
              </div>
            )}

            {message.phone && (
              <div className="border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-slate-950 flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-500">Số điện thoại</p>
                  <a
                    href={`tel:${message.phone}`}
                    className="text-xs font-bold text-slate-900 dark:text-white hover:text-[#ed1c24] truncate block"
                  >
                    {message.phone}
                  </a>
                </div>
              </div>
            )}

            {message.subject && (
              <div className="border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-slate-950 flex items-center gap-2.5 sm:col-span-2">
                <MessageSquare className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-500">Tiêu đề / Chủ đề</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{message.subject}</p>
                </div>
              </div>
            )}
          </div>

          {/* Full Message Content */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nội dung tin nhắn
            </Label>
            <div className="border border-slate-200 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-slate-950/60 text-xs leading-relaxed font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {message.message || "(Không có nội dung)"}
            </div>
            <p className="text-[10px] font-semibold text-slate-400">
              Gửi lúc: {new Date(message.created_at).toLocaleString("vi-VN")}
            </p>
          </div>

          {/* Extra Fields */}
          {extra.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Các trường dữ liệu bổ sung
              </Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {extra.map(([k, v]) => (
                  <div
                    key={k}
                    className="border border-slate-200 bg-slate-50/40 p-2.5 dark:border-white/10 dark:bg-slate-950 text-xs"
                  >
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{k}</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status & Read Toggle */}
          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Trạng thái xử lý
              </Label>
              <Select
                value={message.status}
                onValueChange={(v) => onStatusChange(message, v)}
              >
                <SelectTrigger className="h-9.5 rounded-none border-slate-200 bg-white text-xs font-bold dark:border-white/10 dark:bg-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-slate-200 dark:border-white/10">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs font-bold">
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onToggleRead(message, !message.is_read)}
                className="h-9.5 w-full rounded-none border-slate-200 text-xs font-black uppercase dark:border-white/10"
              >
                {message.is_read ? (
                  <>
                    <Circle className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    Đánh dấu chưa đọc
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-[#ed1c24]" />
                    Đã đọc
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Admin Internal Note */}
          <div className="space-y-1.5 pt-2">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ghi chú nội bộ
            </Label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thêm ghi chú xử lý tin nhắn cho đội ngũ nội bộ..."
              className="rounded-none border-slate-200 bg-white text-xs dark:border-white/10 dark:bg-slate-900 resize-none"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => onSaveNote(message, note)}
                className="h-8.5 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Lưu ghi chú
              </Button>
            </div>
          </div>
        </div>

        {/* Dialog Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-white/10 dark:bg-slate-950">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-8.5 rounded-none border-slate-300 text-xs font-black uppercase"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ============================================================
   FIELDS PANEL (FORM BUILDER)
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
    if (error) {
      toast({ title: "Lỗi tải trường", description: error.message, variant: "destructive" })
    } else {
      setFields(
        (data || []).map((d: any) => ({
          ...d,
          options: Array.isArray(d.options)
            ? d.options.map((o: any) => (typeof o === "string" ? { label: o, value: o } : o))
            : [],
          width: d.width === "half" ? "half" : "full",
        }))
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

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

  const openEdit = (f: FormField) => {
    setEditing({ ...f })
    setOpen(true)
  }

  const remove = async (f: FormField) => {
    const { error } = await supabase.from("contact_form_fields").delete().eq("id", f.id)
    if (error) {
      toast({ title: "Lỗi xóa trường", description: error.message, variant: "destructive" })
    } else {
      setFields((prev) => prev.filter((x) => x.id !== f.id))
      toast({ title: "Đã xóa trường thành công" })
    }
  }

  const toggleActive = async (f: FormField) => {
    const nextStatus = !f.is_active
    const { error } = await supabase
      .from("contact_form_fields")
      .update({ is_active: nextStatus })
      .eq("id", f.id)
    if (!error) {
      setFields((prev) => prev.map((x) => (x.id === f.id ? { ...x, is_active: nextStatus } : x)))
    }
  }

  const move = async (f: FormField, dir: -1 | 1) => {
    const idx = fields.findIndex((x) => x.id === f.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= fields.length) return
    const a = fields[idx]
    const b = fields[swapIdx]
    await supabase.from("contact_form_fields").update({ sort_order: b.sort_order }).eq("id", a.id)
    await supabase.from("contact_form_fields").update({ sort_order: a.sort_order }).eq("id", b.id)
    load()
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header card */}
      <div className="border border-slate-200 bg-white p-5 shadow-2xs dark:border-white/10 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">
            Danh sách trường biểu mẫu liên hệ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cấu hình các ô nhập liệu hiển thị trên biểu mẫu trang liên hệ.
          </p>
        </div>
        <Button
          onClick={openNew}
          className="h-10 px-5 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218] shadow-xs shrink-0"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Thêm trường mới
        </Button>
      </div>

      {/* Fields List */}
      <div className="border border-slate-200 bg-white shadow-2xs dark:border-white/10 dark:bg-slate-900 overflow-hidden w-full">
        {loading ? (
          <div className="p-10 text-center text-xs font-bold uppercase text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-[#ed1c24] mb-2" />
            Đang tải danh sách trường...
          </div>
        ) : fields.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-xs font-bold uppercase tracking-wider">Chưa có trường nào được tạo.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {fields.map((f, i) => (
              <div
                key={f.id}
                className="p-4 flex items-center gap-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none text-slate-400 hover:text-slate-900"
                    disabled={i === 0}
                    onClick={() => move(f, -1)}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none text-slate-400 hover:text-slate-900"
                    disabled={i === fields.length - 1}
                    onClick={() => move(f, 1)}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                      {f.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {f.field_key}
                    </span>
                    <Badge
                      variant="outline"
                      className="rounded-none text-[10px] font-bold border-slate-200 dark:border-white/10"
                    >
                      {FIELD_TYPES.find((t) => t.value === f.field_type)?.label || f.field_type}
                    </Badge>
                    {f.is_required && (
                      <Badge className="rounded-none bg-red-50 text-[#ed1c24] border border-red-200 text-[10px] font-bold">
                        Bắt buộc
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="rounded-none text-[10px] font-bold border-slate-200 text-slate-500"
                    >
                      {f.width === "half" ? "1/2 hàng" : "Full hàng"}
                    </Badge>
                  </div>
                  {f.placeholder && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Placeholder: {f.placeholder}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <Switch
                      checked={f.is_active}
                      onCheckedChange={() => toggleActive(f)}
                    />
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      {f.is_active ? "Bật" : "Tắt"}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEdit(f)}
                    className="h-8.5 w-8.5 rounded-none border-slate-200 hover:border-[#ed1c24] hover:text-[#ed1c24]"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8.5 w-8.5 rounded-none border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300"
                        title="Xóa trường"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-none border border-slate-200 bg-white p-0 dark:border-white/10 dark:bg-slate-900 overflow-hidden shadow-2xl">
                      <div className="h-1 w-full bg-[#ed1c24]" />
                      <div className="p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-lg font-black uppercase text-slate-900 dark:text-white">
                            Xóa trường "{f.label}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Trường này sẽ không còn hiển thị trên biểu mẫu trang liên hệ.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                      </div>
                      <AlertDialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-white/10 dark:bg-slate-950">
                        <AlertDialogCancel className="h-9 rounded-none text-xs font-black uppercase">
                          Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => remove(f)}
                          className="h-9 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
                        >
                          Xác nhận xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FieldEditorDialog
        open={open}
        onOpenChange={setOpen}
        field={editing}
        onSaved={load}
      />
    </div>
  )
}

function FieldEditorDialog({
  open,
  onOpenChange,
  field,
  onSaved,
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
      field?.options
        ?.map((o) => (o.label === o.value ? o.value : `${o.label}|${o.value}`))
        .join("\n") || ""
    )
  }, [field])

  if (!form) return null

  const needsOptions = ["select", "radio"].includes(form.field_type)

  const save = async () => {
    if (!form.label.trim()) {
      toast({ title: "Vui lòng nhập nhãn hiển thị", variant: "destructive" })
      return
    }
    if (!form.field_key.trim()) {
      toast({ title: "Vui lòng nhập mã định danh field_key", variant: "destructive" })
      return
    }

    setSaving(true)
    const options = needsOptions
      ? optionsText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
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
      toast({ title: "Lỗi lưu trường", description: error.message, variant: "destructive" })
    } else {
      toast({ title: form.id ? "Đã cập nhật trường" : "Đã thêm trường mới" })
      onOpenChange(false)
      onSaved()
    }
  }

  const upd = (patch: Partial<FormField>) => setForm({ ...form, ...patch })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-none border border-slate-200 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden select-none max-h-[90vh] overflow-y-auto">
        <div className="h-1 w-full bg-[#ed1c24]" />

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 dark:border-white/10">
          <DialogTitle className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {form.id ? "Chỉnh sửa trường biểu mẫu" : "Thêm trường biểu mẫu mới"}
          </DialogTitle>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nhãn hiển thị *
              </Label>
              <Input
                value={form.label}
                onChange={(e) => upd({ label: e.target.value })}
                placeholder="Ví dụ: Họ và tên, Ngành học..."
                className="h-10 rounded-none border-slate-200 text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mã định danh (field_key) *
              </Label>
              <Input
                value={form.field_key}
                onChange={(e) =>
                  upd({
                    field_key: e.target.value.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase(),
                  })
                }
                placeholder="full_name"
                className="h-10 rounded-none border-slate-200 font-mono text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kiểu dữ liệu
              </Label>
              <Select
                value={form.field_type}
                onValueChange={(v: FieldType) => upd({ field_type: v })}
              >
                <SelectTrigger className="h-10 rounded-none border-slate-200 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-slate-200 dark:border-white/10">
                  {FIELD_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs font-bold">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Độ rộng trên hàng
              </Label>
              <Select
                value={form.width}
                onValueChange={(v: "full" | "half") => upd({ width: v })}
              >
                <SelectTrigger className="h-10 rounded-none border-slate-200 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-slate-200 dark:border-white/10">
                  <SelectItem value="full" className="text-xs font-bold">
                    Toàn bộ hàng (Full)
                  </SelectItem>
                  <SelectItem value="half" className="text-xs font-bold">
                    1/2 hàng (Nửa hàng)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gợi ý nhập (Placeholder)
            </Label>
            <Input
              value={form.placeholder || ""}
              onChange={(e) => upd({ placeholder: e.target.value })}
              placeholder="Nhập gợi ý mờ trong ô..."
              className="h-10 rounded-none border-slate-200 text-xs"
            />
          </div>

          {needsOptions && (
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Danh sách lựa chọn (mỗi dòng 1 mục, có thể dùng <code>nhãn|giá_trị</code>)
              </Label>
              <Textarea
                rows={4}
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder={"Tư vấn khóa học\nHợp tác doanh nghiệp|partnership\nKhác|other"}
                className="rounded-none border-slate-200 text-xs font-mono"
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Bắt buộc nhập
              </span>
              <Switch
                checked={form.is_required}
                onCheckedChange={(v) => upd({ is_required: v })}
              />
            </div>

            <div className="flex items-center justify-between border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-slate-950">
              <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Trạng thái kích hoạt
              </span>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => upd({ is_active: v })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-white/10 dark:bg-slate-950">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-none text-xs font-black uppercase"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-9 rounded-none bg-[#ed1c24] text-xs font-black uppercase text-white hover:bg-[#c91218]"
          >
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Lưu trường
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
