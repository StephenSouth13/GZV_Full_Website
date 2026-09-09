import type { Metadata } from "next"
import PageBanner from "@/components/sections/common/PageBanner"
import StatsBar from "@/components/sections/common/StatsBar"
import ServicesThree from "@/components/sections/home/ServicesThree"
import MentoringModel from "@/components/sections/about/MentoringModel"
import WhyColumns from "@/components/sections/common/WhyColumns"
import CtaBand from "@/components/sections/common/CtaBand"
import BuilderPageGate from "@/components/BuilderPageGate"

export const metadata: Metadata = {
  title: "Dịch vụ - GZV",
  description: "Marketing, Sales và Digital Transformation theo mô hình triển khai thực chiến của GZV.",
}

export default function ServicesPage() {
  return (
    <>
      <PageBanner
        badge="Giải pháp thực chiến"
        title="Dịch vụ"
        subtitle="Marketing, Sales và Digital Transformation theo mô hình triển khai thực chiến của GZV."
      />
      <BuilderPageGate slug="dich-vu">
        <StatsBar
          stats={[
            { value: "3", label: "Mũi triển khai", description: "Marketing, Sales, Chuyển đổi số" },
            { value: "50+", label: "Đối tác", description: "Doanh nghiệp đồng hành" },
            { value: "10+", label: "Lĩnh vực", description: "Kinh nghiệm thực tiễn" },
            { value: "100%", label: "Thực chiến", description: "Tập trung vào kết quả" },
          ]}
        />
        <ServicesThree />
        <MentoringModel />
        <WhyColumns />
        <CtaBand
          title="SẴN SÀNG TRAO ĐỔI BÀI TOÁN TĂNG TRƯỜNG"
          subtitle="Gửi thông tin để đội ngũ GZV tư vấn hướng triển khai phù hợp nhất."
          button_label="Đăng ký tư vấn ngay"
          button_url="/lien-he"
        />
      </BuilderPageGate>
    </>
  )
}
