"use client"

import React from "react"
import PageBanner from "@/components/sections/common/PageBanner"
import StatsBar from "@/components/sections/common/StatsBar"
import BuilderPageGate from "@/components/BuilderPageGate"
import GzversGrid from "@/components/sections/home/GzversGrid"
import CtaBand from "@/components/sections/common/CtaBand"

export default function GzverPage() {
  return (
    <>
      <PageBanner
        badge="GZV ORGANIZATION"
        title="GZVers"
        subtitle="Hệ sinh thái nhân sự GZV được chia theo từng ban để thể hiện rõ vai trò, trách nhiệm và năng lực triển khai."
      />
      <BuilderPageGate slug="gzver">
        <StatsBar
          stats={[
            { value: "50+", label: "GZVers", description: "Nhân sự trẻ trung, nhiệt huyết" },
            { value: "10+", label: "Cố vấn & Mentor", description: "Chuyên gia đầu ngành" },
            { value: "5+", label: "Ban chuyên môn", description: "Vận hành chuyên nghiệp" },
            { value: "100%", label: "Thực chiến", description: "Cam kết đồng hành" },
          ]}
        />
        <GzversGrid
          title="ĐỘI NGŨ NHÂN SỰ GZV"
          subtitle="Đội ngũ nhân sự, cố vấn và chuyên gia đồng hành"
        />
        <CtaBand
          title="GIA NHẬP GZV"
          subtitle="Trở thành một phần của cộng đồng trẻ năng động, sáng tạo và bứt phá giới hạn."
          button_label="Ứng tuyển ngay"
          button_url="/lien-he"
          background_from="#050505"
          background_to="#ed1c24"
        />
      </BuilderPageGate>
    </>
  )
}
