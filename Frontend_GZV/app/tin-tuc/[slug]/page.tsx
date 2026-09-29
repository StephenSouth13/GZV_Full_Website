import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import NewsPostClient from "./NewsPostClient"
import { getArticleSlugRedirect, getInitialBlogPost, getInitialBlogPosts } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getInitialBlogPost(slug)
  if (!post) return { title: "Tin tức" }
  const description = post.excerpt || "Tin tức và hoạt động mới nhất từ GZV LTD."
  const image = post.image || "/og-cover.jpg"
  return {
    title: post.title,
    description,
    alternates: { canonical: `/tin-tuc/${post.slug}` },
    openGraph: { title: post.title, description, type: "article", url: `/tin-tuc/${post.slug}`, siteName: "GZV LTD", images: [{ url: image, alt: post.title }] },
    twitter: { card: "summary_large_image", title: post.title, description, images: [image] },
  }
}

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const allPosts = await getInitialBlogPosts()
  const post = allPosts.find((item: any) => item.slug === slug)
  if (!post) {
    const currentSlug = await getArticleSlugRedirect(slug)
    if (currentSlug) permanentRedirect(`/tin-tuc/${currentSlug}`)
    notFound()
  }

  const others = allPosts.filter((item: any) => item.id !== post.id)
  const relatedPosts = post.category
    ? others.filter((item: any) => item.category === post.category).slice(0, 3)
    : []

  return <NewsPostClient initialPost={post} initialRelatedPosts={relatedPosts} initialLatestPosts={others.slice(0, 4)} />
}
