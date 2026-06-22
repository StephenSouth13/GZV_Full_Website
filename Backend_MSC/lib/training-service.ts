import { supabase, Program, ProgramSchedule } from './supabase'

export class TrainingService {
  static async getAllPrograms(): Promise<Program[]> {
    const { data, error } = await supabase.from('programs').select('*').order('created_at', { ascending: false })
    return error ? [] : (data || [])
  }

  static async getProgramById(idOrSlug: string): Promise<Program | null> {
    const { data, error } = await supabase.from('programs')
      .select('*').or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).single()
    return error ? null : data
  }

  static async saveProgram(programData: Partial<Program>): Promise<Program | null> {
    const { data, error } = await supabase.from('programs')
      .upsert([{ ...programData, updated_at: new Date().toISOString() }])
      .select().single()
    if (error) throw error
    return data
  }

  static async deleteProgram(id: string): Promise<boolean> {
    const { error } = await supabase.from('programs').delete().eq('id', id)
    return !error
  }

  static generateSlug(title: string): string {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  }
}