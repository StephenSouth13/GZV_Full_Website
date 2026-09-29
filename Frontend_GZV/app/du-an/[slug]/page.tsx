import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ProjectDetailClient from "./ProjectDetailClient"
import { getInitialProject, getInitialProjects } from "@/lib/site-content-server"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = await getInitialProject(slug)
  if (!project) return { title: "Dự án" }
  const title = project.title || project.name || "Dự án GZV"
  const description = project.description || project.excerpt || "Dự án nổi bật của GZV LTD."
  const image = project.image || "/og-image.jpg"
  return {
    title,
    description,
    alternates: { canonical: `/du-an/${project.slug}` },
    openGraph: { title, description, type: "article", url: `/du-an/${project.slug}`, siteName: "GZV LTD", images: [{ url: image, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const allProjects = await getInitialProjects()
  const project = allProjects.find((item: any) => item.slug === slug)
  if (!project) notFound()

  const relatedProjects = allProjects
    .filter((item: any) => item.id !== project.id && (item.category === project.category || !project.category))
    .slice(0, 3)

  return <ProjectDetailClient initialProject={project} initialRelatedProjects={relatedProjects} />
}
