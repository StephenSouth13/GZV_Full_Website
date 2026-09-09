"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  author: any
  loading?: boolean
}

export function AuthorDeleteModal({ isOpen, onClose, onConfirm, author, loading }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-none border border-slate-200 bg-white p-0 shadow-2xl dark:border-white/10 dark:bg-slate-900 overflow-hidden select-none">
        {/* Brand Accent Top Line */}
        <div className="h-1 w-full bg-[#ed1c24]" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-red-100 text-[#ed1c24] dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-[#ed1c24] leading-tight">
                XÁC NHẬN XÓA
              </span>
              <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white mt-0.5">
                Xóa hồ sơ tác giả?
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Bạn có chắc chắn muốn xóa hồ sơ tác giả{" "}
                <span className="font-bold text-slate-900 dark:text-white underline decoration-[#ed1c24]">
                  {author?.full_name}
                </span>{" "}
                khỏi hệ thống? Dữ liệu và liên kết bài viết liên quan có thể bị ảnh hưởng.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-3.5 dark:border-white/10 dark:bg-slate-950/50">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
            className="h-9 rounded-none border-slate-300 text-xs font-black uppercase text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-9 rounded-none bg-[#ed1c24] px-4 text-xs font-black uppercase text-white hover:bg-[#c91218] shadow-xs"
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Xác nhận xóa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}