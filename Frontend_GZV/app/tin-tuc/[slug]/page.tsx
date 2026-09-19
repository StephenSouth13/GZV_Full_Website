import { notFound } from "next/navigation"
import NewsPostClient from "./NewsPostClient"
import { getInitialBlogPost, getInitialBlogPosts } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([getInitialBlogPost(slug), getInitialBlogPosts()])
  if (!post) notFound()

  const others = allPosts.filter((item: any) => item.id !== post.id)
  const relatedPosts = post.category
    ? others.filter((item: any) => item.category === post.category).slice(0, 3)
    : []

  return <NewsPostClient initialPost={post} initialRelatedPosts={relatedPosts} initialLatestPosts={others.slice(0, 4)} />
}
