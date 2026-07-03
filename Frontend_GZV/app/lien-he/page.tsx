import type { Metadata } from "next"
import ContactForm from "@/components/ContactForm"
import BuilderPageGate from "@/components/BuilderPageGate"

export const metadata: Metadata = {
  title: "Liên hệ - gzv Center",
  description: "Liên hệ với gzv Center để được tư vấn về các chương trình đào tạo phù hợp",
}

export default function ContactPage() {
  return (
    <BuilderPageGate slug="lien-he">
    <div className="min-h-screen">
      <ContactForm />
    </div>
    </BuilderPageGate>
  )
}
