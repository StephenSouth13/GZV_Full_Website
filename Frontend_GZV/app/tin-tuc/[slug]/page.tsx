'use client'

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, User, Clock, Tag, Share2, Linkedin, Facebook, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { api, BlogPost } from "@/lib/api-supabase"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

// Custom styling for markdown content
const customMarkdownComponents = {
  h1: (props: any) => <h1 className="text-4xl font-bold mt-12 mb-6 text-gray-900 dark:text-white" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-bold mt-10 mb-5 text-gray-900 dark:text-white" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-100" {...props} />,
  p: (props: any) => <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-gray-300" {...props} />,
  ul: (props: any) => <ul className="list-disc list-inside mb-6 pl-4 text-lg text-gray-700 dark:text-gray-300" {...props} />,
  ol: (props: any) => <ol className="list-decimal list-inside mb-6 pl-4 text-lg text-gray-700 dark:text-gray-300" {...props} />,
  li: (props: any) => <li className="mb-3" {...props} />,
  blockquote: (props: any) => <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 text-xl italic text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg" {...props} />,
  img: (props: any) => (
    <div className="my-8">
      <Image 
        src={props.src || '/placeholder.svg'} 
        alt={props.alt || ''} 
        width={1000} 
        height={600} 
        className="rounded-lg shadow-lg mx-auto w-full h-auto"
      />
    </div>
  ),
  a: (props: any) => <a className="text-blue-600 dark:text-blue-400 hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
};


export default function NewsPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const currentPost = await api.getBlogPostBySlug(params.slug)

        if (!currentPost) {
          notFound()
          return
        }
        setPost(currentPost)

        if (currentPost.category) {
            const allPosts = await api.getBlogPostsByCategory(currentPost.category)
            const related = allPosts
              .filter((p) => p.id !== currentPost.id)
              .slice(0, 3) // Get 3 related posts
            setRelatedPosts(related)
        }
        
      } catch (error) {
        console.error('Error fetching post data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.slug])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Ngày không xác định';
    return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-200">Đang tải bài viết...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Back Button */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/tin-tuc">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Tất cả bài viết
            </Button>
          </Link>
        </motion.div>

        <main className="max-w-4xl mx-auto">
          <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            {/* Post Header */}
            <header className="mb-10">
              {post.category &&
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">{post.category}</p>
              }
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center space-x-6 text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">
                    {post.authors && post.authors.length > 0 
                      ? post.authors.map(auth => auth.full_name).join(', ') 
                      : 'gzv Center'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(post.publish_date)}</span>
                </div>
                {post.read_time &&
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>{post.read_time} đọc</span>
                  </div>
                }
              </div>
            </header>

            {/* Post Image */}
            {post.image && (
              <div className="relative aspect-h-9 aspect-w-16 mb-10 rounded-lg overflow-hidden shadow-2xl">
                <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill 
                    className="object-cover" 
                    priority
                />
              </div>
            )}

            {/* Post Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
                 <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    rehypePlugins={[rehypeRaw]}
                    components={customMarkdownComponents}
                 >
                    {post.content || post.excerpt || ''}
                </ReactMarkdown>
            </div>

            {/* Tags and Share */}
            <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between">
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <Tag className="h-5 w-5 text-gray-500" />
                            {post.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    )}
                    <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Chia sẻ:</span>
                        <Button variant="outline" size="icon" className="rounded-full"><Facebook className="h-5 w-5 text-[#1877F2]"/></Button>
                        <Button variant="outline" size="icon" className="rounded-full"><Twitter className="h-5 w-5 text-[#1DA1F2]"/></Button>
                        <Button variant="outline" size="icon" className="rounded-full"><Linkedin className="h-5 w-5 text-[#0A66C2]"/></Button>
                    </div>
                </div>
            </footer>
          </motion.article>
        </main>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <aside className="mt-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Bài viết liên quan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                    <Link href={`/tin-tuc/${relatedPost.slug}`} key={relatedPost.id}>
                        <Card className="h-full flex flex-col group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
                        <div className="relative aspect-h-9 aspect-w-16 overflow-hidden">
                            <Image 
                                src={relatedPost.image || '/placeholder-image.jpg'} 
                                alt={relatedPost.title} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                        </div>
                        <CardContent className="p-5 flex flex-col flex-grow">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400">{relatedPost.title}</h3>
                            <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(relatedPost.publish_date)}
                            </div>
                        </CardContent>
                        </Card>
                    </Link>
                ))}
              </div>
            </div>
          </aside>
        )}

      </div>
    </div>
  )
}
