import { supabase, BlogPost, BlogPostCreate } from './supabase'

const ARTICLE_WRITE_COLUMNS = [
  'title',
  'slug',
  'content',
  'excerpt',
  'image',
  'thumbnail_url',
  'author',
  'author_id',
  'author_ids',
  'category',
  'featured',
  'status',
  'published_at',
  'updated_at',
  'views',
  'likes',
  'image_position_x',
  'image_position_y',
  'image_scale',
] as const

const toArticlePayload = (postData: Partial<BlogPostCreate> & Record<string, any>) => {
  const payload: Record<string, any> = {}

  for (const column of ARTICLE_WRITE_COLUMNS) {
    if (postData[column] !== undefined) payload[column] = postData[column]
  }

  if (postData.publish_date !== undefined && payload.published_at === undefined) {
    payload.published_at = postData.publish_date
  }

  return payload
}

export class BlogService {
  static supabase: any

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

  static async createPost(postData: BlogPostCreate): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert([toArticlePayload(postData)])
        .select('*')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating blog post:', error)
      throw error
    }
  }

  static async updatePost(id: string, postData: Partial<BlogPostCreate> & Record<string, any>): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update(toArticlePayload(postData))
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

  static async deletePost(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting blog post:', error)
      return false
    }
  }

  static async incrementViews(id: string): Promise<void> {
    try {
      const { data: currentPost, error: fetchError } = await supabase
        .from('articles')
        .select('views')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentViews = currentPost?.views || 0
      const { error } = await supabase
        .from('articles')
        .update({ views: currentViews + 1 })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  static async incrementLikes(id: string): Promise<void> {
    try {
      const { data: currentPost, error: fetchError } = await supabase
        .from('articles')
        .select('likes')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const currentLikes = currentPost?.likes || 0
      const { error } = await supabase
        .from('articles')
        .update({ likes: currentLikes + 1 })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing likes:', error)
    }
  }

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}
