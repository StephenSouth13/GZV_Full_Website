"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { Partner } from "@/app/admin/partners/page"

interface Props {
  isOpen: boolean
  onClose: () => void
  partner: Partner | null
  onConfirm: () => void
}

export function PartnerDeleteModal({ isOpen, onClose, partner, onConfirm }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-full">
              <AlertTriangle className="text-red-500" />
            </div>
            <DialogTitle className="text-xl font-black">Xóa đối tác?</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400 pt-2">
            Bạn sắp xóa <span className="font-bold text-white">{partner?.name}</span>.
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}
            className="border-zinc-800 bg-transparent text-white hover:bg-zinc-900">
            Hủy
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold">
            Xác nhận xóa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
