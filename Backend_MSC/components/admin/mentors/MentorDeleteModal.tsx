"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'

export function MentorDeleteModal({ isOpen, onClose, onConfirm, mentor, loading }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gray-950 border border-rose-500/20 text-white rounded-[2rem] p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 animate-pulse">
            <AlertTriangle size={48} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Xóa hồ sơ chuyên gia?</DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Bạn đang yêu cầu xóa hồ sơ của <b>{mentor?.full_name}</b>. Hành động này không thể hoàn tác và sẽ gỡ bỏ chuyên gia khỏi toàn bộ hệ thống Web.
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="mt-8 gap-3 sm:justify-center">
          <Button variant="ghost" onClick={onClose} className="rounded-full px-8 hover:bg-white/5 font-bold text-gray-400">HỦY BỎ</Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-10 font-bold shadow-2xl shadow-rose-600/30">
            {loading ? <Loader2 className="animate-spin mr-2"/> : <Trash2 className="mr-2" size={18}/>}
            XÁC NHẬN XÓA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}