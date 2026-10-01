// Logic dùng chung giữa server (tải sẵn dữ liệu) và client (cập nhật realtime)
// để trang hiển thị nội dung thật ngay lần đầu, không nháy qua nội dung mặc định.

export type TeamDepartment = {
  id: string
  name?: string
  slug?: string
  description?: string | null
  color?: string | null
  sort_order?: number | null
  [key: string]: any
}

export type TeamData = {
  departments: TeamDepartment[]
  members: any[]
}

// Cấu hình một section trang chủ = props block builder + dòng site_home_sections + settings
export function combineSectionConfig(homeRow?: any, blockProps?: any) {
  return { ...(blockProps || {}), ...(homeRow || {}), ...(homeRow?.settings || {}) }
}

// Chọn bài viết cho khối tin tức trang chủ: ưu tiên danh sách chọn tay, còn lại lấy mới nhất
export function pickHomeArticles(config: any, posts: any[]) {
  const limit = Number(config?.item_limit) || 4
  const selectedIds: string[] = config?.selected_article_ids || []
  if (selectedIds.length > 0 && posts.length > 0) {
    const sorted = selectedIds.map((id) => posts.find((post) => String(post.id) === String(id) || post.slug === id)).filter(Boolean)
    if (sorted.length > 0) return sorted
  }
  return posts.slice(0, limit)
}

// Gom thành viên theo ban, giữ thứ tự ban (sort_order) và thứ tự thành viên (order)
export function groupTeamByDepartment({ departments, members }: TeamData) {
  return [...departments]
    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
    .map((department) => ({
      department,
      members: members.filter((member) => {
        const linked = member.gzver_departments
        return (
          member.department_id === department.id ||
          linked?.id === department.id ||
          (department.name && (member.department_name === department.name || linked?.name === department.name))
        )
      }),
    }))
    .filter((group) => group.members.length > 0)
}
