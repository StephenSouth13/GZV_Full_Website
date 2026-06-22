"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrainingService } from '@/lib/training-service'
import { Loader2 } from 'lucide-react'

export function CreateProgramModal({ open, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')

  const handleCreate = async () => {
    if (!title) return
    setLoading(true)
    try {
      const slug = TrainingService.generateSlug(title)
      await TrainingService.saveProgram({ title, slug, status: 'draft', level: 'Cơ bản' })
      setTitle('')
      onRefresh()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-10 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Khởi tạo khóa học</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400">Tên chương trình đào tạo</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Mentoring Kỹ năng lãnh đạo..." 
              className="h-14 rounded-2xl border-slate-100 font-bold text-lg"
            />
          </div>
          <Button 
            onClick={handleCreate} 
            disabled={loading || !title} 
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-white shadow-xl shadow-blue-500/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : "TIẾP TỤC VÀO EDITOR"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}