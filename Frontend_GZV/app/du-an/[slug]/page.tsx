import { notFound } from "next/navigation"
import ProjectDetailClient from "./ProjectDetailClient"
import { getInitialProject, getInitialProjects } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [project, allProjects] = await Promise.all([getInitialProject(slug), getInitialProjects()])
  if (!project) notFound()

  const relatedProjects = allProjects
    .filter((item: any) => item.id !== project.id && (item.category === project.category || !project.category))
    .slice(0, 3)

  return <ProjectDetailClient initialProject={project} initialRelatedProjects={relatedProjects} />
}
