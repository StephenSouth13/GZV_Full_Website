import AboutPageClient from "./AboutPageClient"
import { getManagedPageInitialData, getTeamIfNeeded } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const initialData = await getManagedPageInitialData("gioi-thieu")
  const initialTeam = await getTeamIfNeeded(initialData.initialBlocks)
  return <AboutPageClient {...initialData} initialTeam={initialTeam} />
}
