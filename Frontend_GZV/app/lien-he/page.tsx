import type { Metadata } from "next"
import ContactForm from "@/components/ContactForm"
import PageBanner from "@/components/sections/common/PageBanner"
import StatsBar from "@/components/sections/common/StatsBar"
import BuilderPageGate from "@/components/BuilderPageGate"

export const metadata: Metadata = {
  title: "Liên hệ - GZV Center",
  description: "Liên hệ với GZV Center để được tư vấn về các chương trình đào tạo và giải pháp phù hợp",
}

export default function ContactPage() {
  return (
    <>
      <PageBanner
        badge="Kết nối & Hợp tác"
        title="Liên hệ"
        subtitle="Chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn trên hành trình phát triển."
      />
      <BuilderPageGate slug="lien-he">
        <StatsBar
          stats={[
            { value: "24h", label: "Phản hồi tối đa", description: "Tiếp nhận thông tin nhanh" },
            { value: "100%", label: "Tận tâm", description: "Tư vấn đúng bài toán" },
            { value: "Free", label: "Tư vấn ban đầu", description: "Đánh giá nhu cầu miễn phí" },
            { value: "1:1", label: "Chuyên gia", description: "Đồng hành trực tiếp" },
          ]}
        />
        <div className="min-h-screen">
          <ContactForm />
        </div>
      </BuilderPageGate>
    </>
  )
}
