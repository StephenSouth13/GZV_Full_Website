"use client"

import React from "react"
import PageBanner from "@/components/sections/common/PageBanner"
import StatsBar from "@/components/sections/common/StatsBar"
import BuilderPageGate from "@/components/BuilderPageGate"
import PartnersListSection from "@/components/sections/PartnersListSection"
import CtaBand from "@/components/sections/common/CtaBand"

export default function DoiTacPage() {
  return (
    <>
      <PageBanner
        title="Đối tác & Đồng hành"
        subtitle="Hệ sinh thái đối tác doanh nghiệp, tập đoàn và viện trường chiến lược cùng GZV kiến tạo giá trị thực chiến."
      />
      <BuilderPageGate slug="doi-tac">
        <StatsBar
          stats={[
            { value: "100+", label: "Đối tác doanh nghiệp", description: "Tập đoàn & Doanh nghiệp hàng đầu" },
            { value: "50+", label: "Trường ĐH & Viện", description: "Hợp tác đào tạo và nghiên cứu" },
            { value: "5000+", label: "Học viên", description: "Được đào tạo và kết nối việc làm" },
            { value: "100%", label: "Thực chiến", description: "Cam kết đồng hành & phát triển" },
          ]}
        />
        <PartnersListSection
          title="MẠNG LƯỚI ĐỐI TÁC CHIẾN LƯỢC"
          subtitle="Đồng hành cùng các tập đoàn, doanh nghiệp và viện trường hàng đầu kiến tạo giá trị thực chiến."
        />
        <CtaBand
          title="HỢP TÁC CÙNG GZV"
          subtitle="Kết nối nguồn nhân lực chất lượng cao, triển khai dự án thực chiến và mở rộng mạng lưới kinh doanh."
          button_label="Liên hệ hợp tác ngay"
          button_url="/lien-he"
          background_from="#050505"
          background_to="#ed1c24"
        />
      </BuilderPageGate>
    </>
  )
}
