//D:\gzv\Backend_gzv\components\admin\projects\DeleteProjectModal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'

export function DeleteProjectModal({ project, isOpen, onClose, onDelete }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-2xl rounded-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 font-black uppercase text-sm">
            <AlertTriangle size={18} /> Xác nhận xóa dự án
          </DialogTitle>
          <DialogDescription className="py-4 text-xs font-semibold text-slate-600">
            Bạn có chắc muốn xóa dự án <strong>&quot;{project?.title}&quot;</strong>? <br/>Hành động này sẽ gỡ bỏ dự án khỏi hệ thống vĩnh viễn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-none text-xs font-bold uppercase">Hủy</Button>
          <Button variant="destructive" className="bg-[#ed1c24] hover:bg-[#c91218] rounded-none text-xs font-bold uppercase" onClick={() => onDelete(project.id)}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Xóa vĩnh viễn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}