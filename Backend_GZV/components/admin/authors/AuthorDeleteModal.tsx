"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, Loader2 } from 'lucide-react'

export function AuthorDeleteModal({ isOpen, onClose, onConfirm, author, loading }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#0a0a0a] border border-rose-500/20 text-white rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 ring-8 ring-rose-500/5">
            <AlertCircle size={40} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Xóa Tác Giả?</DialogTitle>
            <DialogDescription className="text-gray-400 text-sm leading-relaxed">
              Dữ liệu của <b>{author?.full_name}</b> sẽ bị xóa vĩnh viễn khỏi danh mục. 
              <br/><span className="text-rose-400/80 text-[10px] uppercase font-bold tracking-widest mt-2 block">Lưu ý: Các bài viết gắn tên tác giả này có thể bị lỗi hiển thị.</span>
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <DialogFooter className="mt-8 gap-3 sm:justify-center">
          <Button variant="ghost" onClick={onClose} className="rounded-full px-8 hover:bg-white/5 font-black text-gray-500 uppercase text-[10px] tracking-widest">Hủy</Button>
          <Button 
            onClick={onConfirm} 
            disabled={loading} 
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-10 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-rose-600/20"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Trash2 className="mr-2" size={16}/>}
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}