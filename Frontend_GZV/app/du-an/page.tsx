import ProjectsPageClient from "./ProjectsPageClient"
import { getInitialProjects, getManagedPageInitialData } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const [initialProjects, managed] = await Promise.all([
    getInitialProjects(),
    getManagedPageInitialData("du-an"),
  ])

  return <ProjectsPageClient initialProjects={initialProjects} {...managed} />
}
