import { supabase, Program } from './supabase'

export class TrainingService {
  private static mapCourseToProgram(course: any): Program {
    return {
      ...course,
      content: course.content ?? course.modules ?? null,
      is_featured: course.is_featured ?? course.featured ?? false,
      image: course.thumbnail_url,
      duration: course.estimated_duration ?? '',
      students: course.total_lessons != null ? String(course.total_lessons) : '0',
      price: course.price != null ? String(course.price) : '',
    } as Program
  }

  private static toCoursePayload(programData: Partial<Program>) {
    const payload: any = {
      id: programData.id,
      title: programData.title,
      slug: programData.slug,
      description: programData.description ?? programData.short_description,
      modules: programData.content ?? (programData as any).modules,
      level: programData.level,
      status: programData.status,
      thumbnail_url: programData.thumbnail_url ?? programData.image,
      video_url: (programData as any).video_url ?? programData.video_banner_url,
      price: (programData as any).price ?? programData.price_sale ?? programData.price_original,
      featured: programData.is_featured ?? (programData as any).featured,
      detailed_content: programData.detailed_content,
      highlights: programData.highlights,
    }

    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key])
    return payload
  }

  static async getAllPrograms(): Promise<Program[]> {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    return error ? [] : (data || []).map(this.mapCourseToProgram)
  }

  static async getProgramById(idOrSlug: string): Promise<Program | null> {
    const { data, error } = await supabase.from('courses')
      .select('*').or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).single()
    return error ? null : this.mapCourseToProgram(data)
  }

  static async saveProgram(programData: Partial<Program>): Promise<Program | null> {
    const { data, error } = await supabase.from('courses')
      .upsert([this.toCoursePayload(programData)])
      .select().single()
    if (error) throw error
    return this.mapCourseToProgram(data)
  }

  static async deleteProgram(id: string): Promise<boolean> {
    const { error } = await supabase.from('courses').delete().eq('id', id)
    return !error
  }

  static generateSlug(title: string): string {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  }
}
