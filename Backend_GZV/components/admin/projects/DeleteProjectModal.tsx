//D:\MSC\Backend_MSC\components\admin\projects\DeleteProjectModal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'

export function DeleteProjectModal({ project, isOpen, onClose, onDelete }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 font-bold">
            <AlertTriangle size={20} /> Xác nhận xóa dự án
          </DialogTitle>
          <DialogDescription className="py-4">
            Bạn có chắc muốn xóa dự án <strong>"{project?.title}"</strong>? <br/>Hành động này sẽ gỡ bỏ dự án khỏi hệ thống vĩnh viễn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant="destructive" className="bg-red-600" onClick={() => onDelete(project.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Xóa vĩnh viễn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}