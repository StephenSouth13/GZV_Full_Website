'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Program, api } from '@/lib/api-supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
// highlight.js styles are optional; nextjs build sometimes can’t resolve CSS import typings
// import 'highlight.js/styles/github.css'


export default function ProgramDetailPage() {
  const params = useParams()
  const [program, setProgram] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const programs = await api.getPrograms()
        const id = Array.isArray(params.id) ? params.id[0] : params.id
        const foundProgram = programs.find((p) => p.id === id || p.slug === id)
        setProgram(foundProgram || null)
      } catch (error) {
        console.error('Error fetching program:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProgram()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Dang tai chuong trinh...</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Khong tim thay chuong trinh</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Chuong trinh ban dang tim kiem khong ton tai.</p>
          <Link href="/dao-tao">
            <Button>Quay lai danh sach chuong trinh</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
          <Link href="/dao-tao">
              <Button className="mb-4">Quay lai danh sach</Button>
            </Link>


            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{program.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6">
              {program.level && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  {program.level}
                </span>
              )}
              {program.category && (
                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                  {program.category}
                </span>
              )}
              {program.duration && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                  {program.duration}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {program.image && (
                <div className="mb-8">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mo ta chuong trinh</h2>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      components={{
                        p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300">{children}</ul>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                      }}
                    >
                      {program.description || ''}
                    </ReactMarkdown>
                  </div>
                </div>

                {program.detailed_content && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Noi dung chi tiet</h2>
                    <div className="prose prose-lg dark:prose-invert max-w-none
                      prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
                      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                      prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                      prose-pre:bg-gray-900 prose-pre:text-gray-100
                      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
                      prose-ul:list-disc prose-ol:list-decimal
                      prose-li:text-gray-700 dark:prose-li:text-gray-300
                      prose-img:rounded-lg prose-img:shadow-md">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight, rehypeRaw]}
                        components={{
                          h1: ({ children }) => <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-8 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-6">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-5">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 mt-4">{children}</h4>,
                          p: ({ children }) => <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-700 dark:text-gray-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-700 dark:text-gray-300">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg italic text-gray-600 dark:text-gray-400">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className
                            return isInline
                              ? <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">{children}</code>
                              : <code className={className}>{children}</code>
                          },
                          pre: ({ children }) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                          table: ({ children }) => (
                            <div className="overflow-x-auto mb-4">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                              {children}
                            </td>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {program.detailed_content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {program.highlights && program.highlights.length > 0 && (
                  <>
                    <h2>Diem noi bat</h2>
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                      {program.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Thong tin khoa hoc</h3>

                <div className="space-y-4">
                  {program.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Hoc phi:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{program.price}</span>
                    </div>
                  )}

                  {program.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Thoi gian:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{program.duration}</span>
                    </div>
                  )}

                  {program.students && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Hoc vien:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{program.students}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Link href="/lien-he">
                    <Button className="w-full">Dang ky ngay</Button>
                  </Link>
                  <Link href="/lien-he">
                    <Button className="w-full">Tu van mien phi</Button>
                  </Link>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
