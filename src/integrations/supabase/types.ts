export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author: string | null
          author_id: string | null
          author_ids: string[] | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          image: string | null
          likes: number | null
          published_at: string | null
          slug: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          author_ids?: string[] | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          likes?: number | null
          published_at?: string | null
          slug: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author?: string | null
          author_id?: string | null
          author_ids?: string[] | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          likes?: number | null
          published_at?: string | null
          slug?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          email: string | null
          facebook_url: string | null
          full_name: string
          id: string
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          position: string | null
          skills: string[] | null
          slug: string | null
          social_links: Json | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          full_name: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          position?: string | null
          skills?: string[] | null
          slug?: string | null
          social_links?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          full_name?: string
          id?: string
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          position?: string | null
          skills?: string[] | null
          slug?: string | null
          social_links?: Json | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_form_fields: {
        Row: {
          created_at: string
          field_key: string
          field_type: string
          help_text: string | null
          id: string
          is_active: boolean
          is_required: boolean
          label: string
          options: Json
          placeholder: string | null
          sort_order: number
          updated_at: string
          width: string
        }
        Insert: {
          created_at?: string
          field_key: string
          field_type?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          label: string
          options?: Json
          placeholder?: string | null
          sort_order?: number
          updated_at?: string
          width?: string
        }
        Update: {
          created_at?: string
          field_key?: string
          field_type?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          label?: string
          options?: Json
          placeholder?: string | null
          sort_order?: number
          updated_at?: string
          width?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_note: string | null
          created_at: string
          data: Json
          email: string | null
          id: string
          is_read: boolean
          message: string | null
          name: string | null
          phone: string | null
          source: string | null
          status: string
          subject: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          data?: Json
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          name?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          data?: Json
          email?: string | null
          id?: string
          is_read?: boolean
          message?: string | null
          name?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          level: string | null
          modules: Json | null
          price: number | null
          slug: string
          status: string | null
          thumbnail_url: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          level?: string | null
          modules?: Json | null
          price?: number | null
          slug: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          level?: string | null
          modules?: Json | null
          price?: number | null
          slug?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          bucket_name: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          bucket_name?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          bucket_name?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_type: string | null
          file_url: string
          id: string
          storage_path: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          storage_path?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          storage_path?: string | null
        }
        Relationships: []
      }
      mentors: {
        Row: {
          avatar_url: string | null
          awards: string[] | null
          background: Json | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          full_name: string
          id: string
          is_active: boolean | null
          linkedin_url: string | null
          order: number | null
          organizations: Json | null
          phone: string | null
          portfolio_url: string | null
          practical_projects: string[] | null
          research_projects: string[] | null
          slug: string
          specialties: string[] | null
          teaching_subjects: string[] | null
          tech_business_achievements: string[] | null
          title: string | null
          updated_at: string | null
          visible_sections: Json | null
        }
        Insert: {
          avatar_url?: string | null
          awards?: string[] | null
          background?: Json | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          order?: number | null
          organizations?: Json | null
          phone?: string | null
          portfolio_url?: string | null
          practical_projects?: string[] | null
          research_projects?: string[] | null
          slug: string
          specialties?: string[] | null
          teaching_subjects?: string[] | null
          tech_business_achievements?: string[] | null
          title?: string | null
          updated_at?: string | null
          visible_sections?: Json | null
        }
        Update: {
          avatar_url?: string | null
          awards?: string[] | null
          background?: Json | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          order?: number | null
          organizations?: Json | null
          phone?: string | null
          portfolio_url?: string | null
          practical_projects?: string[] | null
          research_projects?: string[] | null
          slug?: string
          specialties?: string[] | null
          teaching_subjects?: string[] | null
          tech_business_achievements?: string[] | null
          title?: string | null
          updated_at?: string | null
          visible_sections?: Json | null
        }
        Relationships: []
      }
      gzvers: {
        Row: {
          achievement_summary: string | null
          achievements_list: string[] | null
          avatar_url: string | null
          background: Json | null
          company: string | null
          course_taken: string | null
          created_at: string | null
          cv_url: string | null
          full_name: string
          graduation_year: string | null
          id: string
          is_active: boolean | null
          is_director: boolean | null
          mentoring_content: string | null
          order: number | null
          position: string | null
          promotion_path: string | null
          skills: string[] | null
          slug: string
          social_impact: string | null
          social_links: Json | null
          testimonial: string | null
          updated_at: string | null
        }
        Insert: {
          achievement_summary?: string | null
          achievements_list?: string[] | null
          avatar_url?: string | null
          background?: Json | null
          company?: string | null
          course_taken?: string | null
          created_at?: string | null
          cv_url?: string | null
          full_name: string
          graduation_year?: string | null
          id?: string
          is_active?: boolean | null
          is_director?: boolean | null
          mentoring_content?: string | null
          order?: number | null
          position?: string | null
          promotion_path?: string | null
          skills?: string[] | null
          slug: string
          social_impact?: string | null
          social_links?: Json | null
          testimonial?: string | null
          updated_at?: string | null
        }
        Update: {
          achievement_summary?: string | null
          achievements_list?: string[] | null
          avatar_url?: string | null
          background?: Json | null
          company?: string | null
          course_taken?: string | null
          created_at?: string | null
          cv_url?: string | null
          full_name?: string
          graduation_year?: string | null
          id?: string
          is_active?: boolean | null
          is_director?: boolean | null
          mentoring_content?: string | null
          order?: number | null
          position?: string | null
          promotion_path?: string | null
          skills?: string[] | null
          slug?: string
          social_impact?: string | null
          social_links?: Json | null
          testimonial?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          logo_url: string
          name: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url: string
          name: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string
          name?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          achievements: string[] | null
          avatar_url: string | null
          awards: string[] | null
          bio: string | null
          created_at: string | null
          education: Json | null
          email: string | null
          full_name: string | null
          id: string
          mentoring_info: string | null
          organization: string[] | null
          personal_info: Json | null
          practical_works: string[] | null
          research_projects: string[] | null
          role: string | null
          skills: string[] | null
          slug: string | null
          social_impact: string | null
          status: string | null
          subjects: string[] | null
          work_history: string[] | null
        }
        Insert: {
          achievements?: string[] | null
          avatar_url?: string | null
          awards?: string[] | null
          bio?: string | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          full_name?: string | null
          id: string
          mentoring_info?: string | null
          organization?: string[] | null
          personal_info?: Json | null
          practical_works?: string[] | null
          research_projects?: string[] | null
          role?: string | null
          skills?: string[] | null
          slug?: string | null
          social_impact?: string | null
          status?: string | null
          subjects?: string[] | null
          work_history?: string[] | null
        }
        Update: {
          achievements?: string[] | null
          avatar_url?: string | null
          awards?: string[] | null
          bio?: string | null
          created_at?: string | null
          education?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          mentoring_info?: string | null
          organization?: string[] | null
          personal_info?: Json | null
          practical_works?: string[] | null
          research_projects?: string[] | null
          role?: string | null
          skills?: string[] | null
          slug?: string | null
          social_impact?: string | null
          status?: string | null
          subjects?: string[] | null
          work_history?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "role_permissions"
            referencedColumns: ["role"]
          },
        ]
      }
      program_schedules: {
        Row: {
          created_at: string | null
          current_enrolled: number | null
          end_date: string | null
          id: string
          max_students: number | null
          program_id: string | null
          registration_deadline: string | null
          start_date: string
          status: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          current_enrolled?: number | null
          end_date?: string | null
          id?: string
          max_students?: number | null
          program_id?: string | null
          registration_deadline?: string | null
          start_date: string
          status?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          current_enrolled?: number | null
          end_date?: string | null
          id?: string
          max_students?: number | null
          program_id?: string | null
          registration_deadline?: string | null
          start_date?: string
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_schedules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          category: string | null
          content: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_duration: string | null
          gallery: Json | null
          id: string
          is_featured: boolean | null
          level: string | null
          price_original: number | null
          price_sale: number | null
          short_description: string | null
          slug: string
          status: string | null
          theme_color: string | null
          thumbnail_url: string | null
          title: string
          total_lessons: number | null
          updated_at: string | null
          video_banner_url: string | null
        }
        Insert: {
          category?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration?: string | null
          gallery?: Json | null
          id?: string
          is_featured?: boolean | null
          level?: string | null
          price_original?: number | null
          price_sale?: number | null
          short_description?: string | null
          slug: string
          status?: string | null
          theme_color?: string | null
          thumbnail_url?: string | null
          title: string
          total_lessons?: number | null
          updated_at?: string | null
          video_banner_url?: string | null
        }
        Update: {
          category?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration?: string | null
          gallery?: Json | null
          id?: string
          is_featured?: boolean | null
          level?: string | null
          price_original?: number | null
          price_sale?: number | null
          short_description?: string | null
          slug?: string
          status?: string | null
          theme_color?: string | null
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number | null
          updated_at?: string | null
          video_banner_url?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          author_ids: string[] | null
          category: string | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          detailproject: string | null
          featured: boolean | null
          gallery: string[] | null
          hashtags: string | null
          id: string
          image: string | null
          mentor_ids: string[] | null
          order_index: number | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string | null
          status: string | null
          tech_stack: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          author_ids?: string[] | null
          category?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          detailproject?: string | null
          featured?: boolean | null
          gallery?: string[] | null
          hashtags?: string | null
          id?: string
          image?: string | null
          mentor_ids?: string[] | null
          order_index?: number | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string | null
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          author_ids?: string[] | null
          category?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          detailproject?: string | null
          featured?: boolean | null
          gallery?: string[] | null
          hashtags?: string | null
          id?: string
          image?: string | null
          mentor_ids?: string[] | null
          order_index?: number | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string | null
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          permissions: string[]
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          permissions: string[]
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          permissions?: string[]
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_core_values: {
        Row: {
          color_code: string | null
          description: string | null
          display_order: number | null
          id: string
          title: string
        }
        Insert: {
          color_code?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          title: string
        }
        Update: {
          color_code?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      training_page_settings: {
        Row: {
          benefit_description: string | null
          benefit_title: string | null
          cta_description: string | null
          cta_title: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          stats: Json | null
          updated_at: string | null
        }
        Insert: {
          benefit_description?: string | null
          benefit_title?: string | null
          cta_description?: string | null
          cta_title?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          stats?: Json | null
          updated_at?: string | null
        }
        Update: {
          benefit_description?: string | null
          benefit_title?: string | null
          cta_description?: string | null
          cta_title?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          stats?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      allblogposts: {
        Row: {
          author: string | null
          author_id: string | null
          author_ids: string[] | null
          authors_details: Json | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          id: string | null
          image: string | null
          likes: number | null
          publish_date: string | null
          published_at: string | null
          slug: string | null
          status: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          author_ids?: string[] | null
          authors_details?: never
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string | null
          image?: string | null
          likes?: number | null
          publish_date?: never
          published_at?: string | null
          slug?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author?: string | null
          author_id?: string | null
          author_ids?: string[] | null
          authors_details?: never
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string | null
          image?: string | null
          likes?: number | null
          publish_date?: never
          published_at?: string | null
          slug?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
