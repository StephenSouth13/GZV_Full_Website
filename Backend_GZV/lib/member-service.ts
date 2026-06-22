// lib/member-service.ts
import { supabase } from './supabase'

export const MemberService = {
  // 1. Lấy danh sách Mentor hoặc MSCer (Dùng cho trang danh sách và Dropdown chọn tác giả)
  async getMembersByType(role: 'mentor' | 'mscer') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, title, avatar, role, slug, company')
      .eq('role', role)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 2. Lấy chi tiết một người (Dùng cho trang /mentors/[slug] hoặc /mscer/[id])
  async getMemberDetail(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*') 
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 3. CMS: Tạo mới hoặc Cập nhật hồ sơ (Dùng cho Modal Quản lý Mentor/MSCer)
  async upsertMember(memberData: any) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: memberData.id || undefined, // Nếu có ID thì là Update, không thì Insert
        name: memberData.name,
        slug: memberData.slug,
        title: memberData.title,
        role: memberData.role,
        avatar: memberData.avatar,
        bio: memberData.bio,
        company: memberData.company,
        // Lưu các mảng dữ liệu dưới dạng JSONB để khớp với cấu trúc bạn đã gửi
        work_history: memberData.workHistory,
        education: memberData.education,
        achievements: memberData.achievements,
        skills: memberData.skills,
        personal_info: memberData.personalInfo,
        updated_at: new Date()
      })
      .select();

    if (error) throw error;
    return data[0];
  },

  // 4. CMS: Xóa hồ sơ
  async deleteMember(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}