import { supabase, BlogPost, BlogPostCreate } from './supabase'

export class BlogService {
  static supabase: any
  // Lấy tất cả bài viết
  static async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('allblogposts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  }

  // Tạo bài viết mới
  static async createPost(postData: BlogPostCreate): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('allblogposts')
        .insert([postData])
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating blog post:', error)
      throw error
    }
  }

  // Cập nhật bài viết
  static async updatePost(id: number, postData: Partial<BlogPostCreate>): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('allblogposts')
        .update(postData)
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating blog post:', error)
      throw error
    }
  }

  // Xóa bài viết
  static async deletePost(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('allblogposts')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting blog post:', error)
      return false
    }
  }

  // Tăng lượt view
  static async incrementViews(id: number): Promise<void> {
    try {
      // First get current views count
      const { data: currentPost, error: fetchError } = await supabase
        .from('allblogposts')
        .select('views')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentViews = currentPost?.views || 0
      const { error } = await supabase
        .from('allblogposts')
        .update({ views: currentViews + 1 })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  // Tăng lượt like
  static async incrementLikes(id: number): Promise<void> {
    try {
      // First get current likes count
      const { data: currentPost, error: fetchError } = await supabase
        .from('allblogposts')
        .select('likes')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentLikes = currentPost?.likes || 0
      const { error } = await supabase
        .from('allblogposts')
        .update({ likes: currentLikes + 1 })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing likes:', error)
    }
  }

  // Tạo slug từ title
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }
}