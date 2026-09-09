"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"

export function MentorDeleteModal({ isOpen, onClose, onConfirm, mentor, loading }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-none border border-red-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-red-900/40 dark:bg-slate-950 dark:text-white sm:p-8">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <AlertTriangle size={24} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight">
              Xóa hồ sơ chuyên gia?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium mt-1">
              Bạn đang yêu cầu xóa hồ sơ của{" "}
              <strong className="text-slate-900 dark:text-white font-bold">{mentor?.full_name}</strong>.
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-none text-xs font-bold"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-none bg-red-600 text-xs font-black uppercase text-white hover:bg-red-700"
          >
            {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}