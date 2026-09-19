import NewsPageClient from "./NewsPageClient"
import { getInitialBlogPosts, getManagedPageInitialData } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function NewsPage() {
  const [articles, managed] = await Promise.all([
    getInitialBlogPosts(),
    getManagedPageInitialData("tin-tuc"),
  ])

  return <NewsPageClient initialArticles={articles} {...managed} />
}
