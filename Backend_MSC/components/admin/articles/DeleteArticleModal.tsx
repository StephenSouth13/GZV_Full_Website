//D:\MSC\Backend_MSC\components\admin\articles\DeleteArticleModal.tsx
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, Loader2, Info } from 'lucide-react'

export function DeleteArticleModal({ article, isOpen, onClose, onDeleteArticle }: any) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm xử lý xóa để quản lý trạng thái loading ngay tại Modal
  const handleConfirmDelete = async () => {
    if (!article?.id) return;
    
    setIsDeleting(true);
    try {
      // Gọi hàm xóa từ trang cha (ArticlesPage)
      await onDeleteArticle(article.id);
      // Lưu ý: onClose() nên được trang cha gọi sau khi xóa thành công trong Database
    } catch (error) {
      console.error("Lỗi khi xác nhận xóa bài viết:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] bg-white border-none shadow-2xl p-0 overflow-hidden text-slate-900 rounded-3xl">
        {/* Header Cảnh báo đỏ */}
        <div className="bg-red-50 p-6 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-bounce">
            <AlertCircle size={32} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-red-700 font-black text-2xl tracking-tight">
              Xác nhận xóa bài?
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-8">
          <DialogDescription className="text-slate-600 text-center text-base leading-relaxed">
            Bạn đang yêu cầu xóa vĩnh viễn bài viết: <br />
            <span className="font-black text-slate-900 text-lg block mt-2 px-4 break-words">
              "{article?.title}"
            </span>
          </DialogDescription>

          <div className="mt-6 flex items-start gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
            <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-700 leading-snug font-medium">
              Hành động này sẽ gỡ bài viết khỏi cơ sở dữ liệu và website MSC. Bạn không thể khôi phục dữ liệu này sau khi đã xóa.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 p-8 pt-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-12 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
          >
            Giữ lại bài
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all font-black" 
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ĐANG XÓA...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                XÓA NGAY
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}