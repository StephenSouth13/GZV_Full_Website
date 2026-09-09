"use client"

export interface HtmlBlockProps {
  html: string
  maxWidth?: string
}

export default function HtmlBlock({ html, maxWidth = "960px" }: HtmlBlockProps) {
  if (!html) return null
  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container px-4">
        <div className="prose prose-lg mx-auto max-w-none dark:prose-invert" style={{ maxWidth }} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  )
}
