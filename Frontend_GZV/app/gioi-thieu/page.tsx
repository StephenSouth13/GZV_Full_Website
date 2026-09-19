import AboutPageClient from "./AboutPageClient"
import { getManagedPageInitialData } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function AboutPage() {
  const initialData = await getManagedPageInitialData("gioi-thieu")
  return <AboutPageClient {...initialData} />
}
