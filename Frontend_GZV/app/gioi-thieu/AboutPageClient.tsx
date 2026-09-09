"use client"

import React from "react"
import PageBanner from "@/components/sections/common/PageBanner"
import BuilderPageGate from "@/components/BuilderPageGate"
import StatsBar from "@/components/sections/common/StatsBar"
import StorySplit from "@/components/sections/about/StorySplit"
import FeatureGrid from "@/components/sections/common/FeatureGrid"
import PeopleGrid from "@/components/sections/about/PeopleGrid"
import TimelineBlock from "@/components/sections/about/TimelineBlock"
import MentoringModel from "@/components/sections/about/MentoringModel"
import CtaBand from "@/components/sections/common/CtaBand"

export default function AboutPageClient() {
  return (
    <>
      <PageBanner />
      <BuilderPageGate slug="gioi-thieu">
        <StatsBar
          stats={[
            { value: "50+", label: "Doanh nghiệp", description: "Đối tác chiến lược" },
            { value: "5000+", label: "Học viên", description: "Tham gia các khóa đào tạo" },
            { value: "100+", label: "Mentor & Chuyên gia", description: "Mạng lưới cố vấn thực chiến" },
            { value: "95%", label: "Tỷ lệ hài lòng", description: "Đánh giá chất lượng đào tạo" },
          ]}
        />
        <StorySplit
          title="CÂU CHUYỆN GZV"
          subtitle="Từ một cộng đồng học hỏi đến hệ sinh thái triển khai thực chiến."
          body="GZV được xây dựng để kết nối thế hệ trẻ, chuyên gia và doanh nghiệp trong cùng một môi trường học tập - làm thật - tạo tác động thật. Chúng tôi tin rằng năng lực chỉ bền vững khi được rèn trong dự án thực tế, dưới sự đồng hành của những người có kinh nghiệm."
          image_url="/gioi-thieu/19.webp"
          image_alt="Câu chuyện GZV"
          position_x={50}
          position_y={50}
          image_size={100}
          stats={[
            { value: "50+", label: "Doanh nghiệp" },
            { value: "5000+", label: "Học viên" },
            { value: "10+", label: "Lĩnh vực" },
          ]}
        />
        <FeatureGrid
          title="SỨ MỆNH"
          subtitle="Kết nối tri thức, chuyên gia và doanh nghiệp để tạo năng lực tăng trưởng có thể đo lường."
          columns={1}
          items={[
            {
              title: "Tạo năng lực thực chiến",
              description: "GZV giúp người trẻ và doanh nghiệp phát triển thông qua mentoring, coaching và dự án thực tế.",
              icon: "target",
              color: "#ed1c24",
            },
          ]}
        />
        <FeatureGrid
          title="TẦM NHÌN"
          subtitle="Trở thành hệ sinh thái mentoring, coaching và triển khai dự án thế hệ mới tại Việt Nam."
          columns={1}
          items={[
            {
              title: "Hệ sinh thái Next-Gen",
              description: "Xây dựng mạng lưới chuyên gia, GZVers và đối tác cùng tạo giá trị bền vững.",
              icon: "compass",
              color: "#050505",
            },
          ]}
        />
        <FeatureGrid
          title="GIÁ TRỊ CỐT LÕI"
          subtitle="Những nguyên tắc giúp GZV vận hành sắc cạnh và đáng tin cậy."
          columns={4}
          items={[
            {
              title: "Thực chiến",
              description: "Tập trung vào kết quả và bài toán thật.",
              icon: "rocket",
              color: "#ed1c24",
            },
            {
              title: "Minh bạch",
              description: "Rõ mục tiêu, rõ dữ liệu, rõ trách nhiệm.",
              icon: "shield",
              color: "#050505",
            },
            {
              title: "Học hỏi liên tục",
              description: "Luôn cải tiến từ phản hồi và thực nghiệm.",
              icon: "book",
              color: "#ed1c24",
            },
            {
              title: "Tạo tác động",
              description: "Ưu tiên giá trị đo lường được cho cộng đồng và đối tác.",
              icon: "award",
              color: "#050505",
            },
          ]}
        />
        <PeopleGrid
          title="BAN ĐIỀU HÀNH"
          subtitle="Lấy dữ liệu tự động từ GZVers đã đánh dấu ban điều hành."
          type="directors"
          limit={6}
        />
        <TimelineBlock
          title="LỘ TRÌNH PHÁT TRIỂN CỦA GZV"
          subtitle="Các chặng phát triển được thiết kế để mở rộng năng lực cộng đồng và năng lực triển khai."
          items={[
            { year: "Giai đoạn 1", title: "Xây nền cộng đồng", description: "Kết nối GZVers, mentor và doanh nghiệp đối tác." },
            { year: "Giai đoạn 2", title: "Chuẩn hóa mô hình", description: "Hoàn thiện mentoring, coaching và project-based learning." },
            { year: "Giai đoạn 3", title: "Triển khai dự án", description: "Đưa đội ngũ vào các bài toán Marketing, Sales, Digital Transformation." },
            { year: "Giai đoạn 4", title: "Mở rộng hệ sinh thái", description: "Phát triển mạng lưới đối tác, chuyên gia và dự án liên ngành." },
          ]}
        />
        <MentoringModel
          title="MÔ HÌNH MENTORING"
          subtitle="GZV kết hợp định hướng cá nhân, huấn luyện kỹ năng và triển khai dự án thật."
          steps={[
            { title: "Đánh giá năng lực", description: "Xác định điểm mạnh, mục tiêu và khoảng trống kỹ năng." },
            { title: "Mentoring cá nhân hóa", description: "Kết nối mentor phù hợp để định hướng lộ trình phát triển." },
            { title: "Dự án thực chiến", description: "Thực hành trên bài toán thật để tạo năng lực có thể đo lường." },
          ]}
        />
        <CtaBand
          title="ĐỒNG HÀNH CÙNG GZV"
          subtitle="Hãy cùng chúng tôi kiến tạo những giá trị mới cho doanh nghiệp và sự nghiệp của bạn."
          button_label="Liên hệ ngay"
          button_url="/lien-he"
          background_from="#050505"
          background_to="#ed1c24"
        />
      </BuilderPageGate>
    </>
  )
}
