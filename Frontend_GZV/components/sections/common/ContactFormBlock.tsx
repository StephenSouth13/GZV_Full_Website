"use client"

import ContactForm, { type ContactFormProps } from "@/components/ContactForm"

export default function ContactFormBlock(props: ContactFormProps) {
  return (
    <div className="w-full">
      <ContactForm {...props} />
    </div>
  )
}
