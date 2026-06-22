//D:\MSC\Backend_MSC\app\admin\articles\[id]\page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft, Clock, Calendar, Share2, Heart, 
  Eye, Loader2, Bookmark, Facebook, Linkedin, Link2 
} from 'lucide-react'
import ReactMarkdown from 'react-markdown' // Nên cài: npm install react-markdown
import Link from 'next/link'
export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params.id as string
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        // Lấy bài viết kèm thông tin Profile tác giả (Join trực tiếp)
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            author_profile:profiles(*) 
          `)
          .eq('id', articleId)
          .single()

        if (error) throw error
        setArticle(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchFullData()
  }, [articleId])

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
  if (!article) return <div className="text-center p-20">Bài viết không tồn tại.</div>

  const author = article.author_profile

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen pb-20">
      {/* ProgressBar (Tùy chọn) */}
      <div className="fixed top-0 left-0 w-full h-1 bg-blue-600 z-50 origin-left" />

      {/* Hero Header: Ảnh bìa lớn và Tiêu đề */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img 
          src={article.image || '/placeholder-blog.jpg'} 
          className="w-full h-full object-cover brightness-50"
          alt={article.title}
        />
        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-6 pb-12">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}>
            <Badge className="mb-4 bg-blue-500 hover:bg-blue-600 text-white border-none px-4 py-1">
              {article.category || 'Chia sẻ'}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl font-serif">
              {article.title}
            </h1>
            <div className="flex items-center gap-6 text-white/90">
               <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{new Date(article.created_at).toLocaleDateString('vi-VN')}</span>
               </div>
               <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{article.read_time || 5} phút đọc</span>
               </div>
               <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{article.views || 0} lượt xem</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        {/* Sidebar TRÁI: Social Share & Interaction */}
        <div className="lg:col-span-1 hidden lg:flex flex-col gap-4 sticky top-32 h-fit">
          <Button variant="outline" size="icon" className="rounded-full hover:text-red-500"><Heart className="h-5 w-5"/></Button>
          <Button variant="outline" size="icon" className="rounded-full hover:text-blue-500"><Facebook className="h-5 w-5"/></Button>
          <Button variant="outline" size="icon" className="rounded-full hover:text-blue-700"><Linkedin className="h-5 w-5"/></Button>
          <Button variant="outline" size="icon" className="rounded-full"><Bookmark className="h-5 w-5"/></Button>
        </div>

        {/* NỘI DUNG CHÍNH */}
        <main className="lg:col-span-8 space-y-12">
          {/* Sapo/Excerpt */}
          <p className="text-2xl font-medium text-slate-600 dark:text-slate-300 italic border-l-4 border-blue-500 pl-6 py-2">
            {article.excerpt}
          </p>

          {/* Body Content: Render Markdown/HTML */}
          <article className="prose prose-slate lg:prose-xl dark:prose-invert max-w-none 
            prose-headings:font-serif prose-a:text-blue-600 prose-img:rounded-2xl prose-img:shadow-xl">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>

          {/* Tag Cloud */}
          <div className="flex flex-wrap gap-2 pt-10 border-t">
            {article.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-blue-100 transition-colors">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* AUTHOR CARD (MENTOR/MSCER INFO) */}
          {author && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center border border-slate-100">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={author.avatar} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">{author.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{author.name}</h3>
                  <Badge className="bg-orange-100 text-orange-600 border-none uppercase text-[10px]">{author.role}</Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {author.bio || "Chuyên gia dẫn dắt tại MSC, đồng hành cùng thế hệ trẻ kiến tạo tương lai."}
                </p>
                <Link href={`/mentors/${author.slug}`}>
                  <Button variant="link" className="p-0 text-blue-600 h-fit text-lg">
                    Xem thêm về Mentor <ArrowLeft className="rotate-180 ml-2 h-4 w-4"/>
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar PHẢI: Related / Newsletter */}
        <aside className="lg:col-span-3 space-y-10">
           <div className="p-6 bg-blue-600 rounded-2xl text-white space-y-4 shadow-xl shadow-blue-500/20">
              <h4 className="font-bold text-xl leading-tight">Sẵn sàng nâng tầm sự nghiệp?</h4>
              <p className="text-sm opacity-90">Tham gia cộng đồng MSCer để nhận những chia sẻ độc quyền từ Mentors.</p>
              <Button className="w-full bg-white text-blue-600 hover:bg-slate-100">Tham gia ngay</Button>
           </div>
           
           <div className="space-y-4">
              <h4 className="font-bold border-b pb-2">Chia sẻ bài viết</h4>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2"><Link2 className="h-4 w-4"/> Copy Link</Button>
              </div>
           </div>
        </aside>
      </div>
    </div>
  )
}