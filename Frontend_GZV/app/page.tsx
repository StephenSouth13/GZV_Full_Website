import HomePageClient from "./HomePageClient"
import { getHomeInitialData } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const data = await getHomeInitialData()
  return <HomePageClient {...data} />
}
