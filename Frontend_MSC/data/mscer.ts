export interface MSCer {
  id: string;
  full_name: string;
  slug: string;
  company: string;
  position: string;
  avatar_url: string;
  cv_url?: string;
  achievement_summary: string;
  testimonial: string;
  graduation_year: string;
  promotion_path: string;
  social_impact: string;
  course_taken: string;
  skills: string[];
  achievements_list: string[];
  mentoring_content: string;
  
  background: {
    education: string;
    previous_role: string;
    experience: string;
  };
  is_active: boolean;
}

export const mscersData: MSCer[] = [
  {
    id: "1",
    full_name: "Phạm Hoàng Minh Khánh",
    slug: "pham-hoang-minh-khanh",
    company: "MSC",
    position: "GIÁM ĐỐC MSC",
    avatar_url: "/MSCers/PHMK.webp",
    achievement_summary: "Nhà sáng lập đa ngành, Giảng viên & Chuyên gia tư vấn chiến lược",
    testimonial: "Hành trình tại MSC đã mở ra cho tôi nhiều cơ hội mới để kết nối và cống hiến.",
    graduation_year: "2022",
    promotion_path: "Từ Trưởng phòng Marketing → Giám đốc → Nhà sáng lập & Viện phó",
    social_impact: "Sáng lập và vận hành 3+ công ty trong lĩnh vực tư vấn, công nghệ và nông nghiệp. Giảng dạy và định hướng cho hàng ngàn sinh viên tại Đại học UEF.",
    course_taken: "Leadership Excellence & Strategic Management",
    skills: ["Lãnh đạo & Quản trị", "Chiến lược Marketing", "Khởi nghiệp", "Tư vấn doanh nghiệp", "Đào tạo"],
    achievements_list: [
      "Sáng lập & Giám đốc Công ty TNHH Smentor (2017-nay)",
      "Sáng lập & Giám đốc Công ty cổ phần SMAR (2020-nay)",
      "Viện Phó, Viện Việt Nam Bách Nghệ Thực Hành (2021-nay)",
      "Giảng viên, Đại học Kinh Tế Tài Chính – TP.HCM (UEF) (2022-nay)"
    ],
    mentoring_content: "Tập trung mentoring cho các nhà sáng lập trẻ về xây dựng mô hình kinh doanh, chiến lược marketing và quản trị nhân sự.",
    background: {
      education: "Thạc sĩ Quản trị hệ điều hành, Đại học Kinh tế TP.HCM (2022)",
      previous_role: "Trưởng phòng Marketing, Phó Giám đốc tại Smentor",
      experience: "Hơn 7 năm kinh nghiệm thực chiến trong lĩnh vực Marketing và điều hành doanh nghiệp."
    },
    is_active: true
  },
  {
    id: "2",
    full_name: "Dương Thế Khải",
    slug: "duong-the-khai",
    company: "MSC",
    position: "PHÓ GIÁM ĐỐC",
    avatar_url: "/MSCers/DTK.webp",
    achievement_summary: "Founder Vietnam Student Marathon & Quản lý dự án chuyên nghiệp",
    testimonial: "Quá trình học tập và làm việc đã cho tôi khả năng quản lý và điều hành sân chơi ý nghĩa cho sinh viên.",
    graduation_year: "2024",
    promotion_path: "Từ Chuyên viên ngân hàng → Quản lý dự án → Founder",
    social_impact: "Sáng lập và tổ chức giải chạy Vietnam Student Marathon, thu hút hàng ngàn sinh viên tham gia.",
    course_taken: "Project Management & Community Building",
    skills: ["Quản lý dự án", "Tổ chức sự kiện", "Lãnh đạo cộng đồng", "Đầu tư"],
    achievements_list: [
      "Founder và Trưởng BTC Vietnam Student Marathon (2023-nay)",
      "Quản lý dự án tại Công ty CP Tập đoàn Nam Quốc (2025-nay)",
      "Trợ lý Giám đốc tại Công ty TNHH F FOUNDATION (2024-nay)"
    ],
    mentoring_content: "Chia sẻ kinh nghiệm về quản lý dự án từ A-Z, từ lên kế hoạch đến thực thi và đo lường hiệu quả.",
    background: {
      education: "Cử nhân Ngân hàng đầu tư - Đại học Kinh tế TP.HCM (2024)",
      previous_role: "Chuyên viên quan hệ khách hàng tại TP Bank",
      experience: "Kinh nghiệm đa dạng từ tài chính đến quản lý dự án cộng đồng và nông nghiệp công nghệ cao."
    },
    is_active: true
  },
  {
    id: "3",
    full_name: "Quách Thành Long",
    slug: "quach-thanh-long",
    company: "MSC",
    position: "TRƯỞNG PHÒNG CNTT",
    avatar_url: "/MSCers/QTL.webp",
    achievement_summary: "Developer đa năng, Business Analyst & Nhà đầu tư",
    testimonial: "Tôi áp dụng kiến thức để xây dựng giải pháp công nghệ tối ưu cho cộng đồng giáo dục.",
    graduation_year: "2024",
    promotion_path: "Từ Business Analyst (Thực tập) → Web Developer → Trưởng phòng CNTT",
    social_impact: "Leader và developer chính của website msc.edu.vn; Tổ chức lớp lập trình cơ bản miễn phí.",
    course_taken: "Technology Leadership & Business Analysis",
    skills: ["Full-Stack Development", "Game Development", "Business Analysis", "Database", "DevOps"],
    achievements_list: [
      "Trưởng phòng Công nghệ thông tin – Trung tâm MSC (05/2025 – nay)",
      "Giải Nhất Học bổng Tài năng VTC Academy – Ngành Phát triển Game (2024)",
      "Leader & Developer website giáo dục msc.edu.vn",
      "Vô địch Marathon VSM 2024 – Cự ly 42km"
    ],
    mentoring_content: "Tổ chức các lớp lập trình miễn phí và chia sẻ kinh nghiệm phát triển sự nghiệp ngành IT.",
    background: {
      education: "Cử nhân Quản trị Nhân lực (2024), Đang học Kinh tế Đầu tư & Game",
      previous_role: "Web Developer, Business Analyst (Intern)",
      experience: "Kết hợp giữa tư duy kinh doanh và kỹ thuật trong phát triển sản phẩm phần mềm."
    },
    is_active: true
  }
];