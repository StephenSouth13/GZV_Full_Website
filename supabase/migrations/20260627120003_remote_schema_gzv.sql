


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user', -- Mặc định là user
    'active'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "excerpt" "text",
    "content" "text",
    "category" "text",
    "featured" boolean DEFAULT false,
    "status" "text" DEFAULT 'published'::"text",
    "thumbnail_url" "text",
    "author_id" "uuid",
    "published_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "image" "text",
    "author" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "views" integer DEFAULT 0,
    "likes" integer DEFAULT 0,
    "author_ids" "uuid"[] DEFAULT '{}'::"uuid"[]
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."authors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "title" "text",
    "avatar_url" "text",
    "bio" "text",
    "skills" "text"[],
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "slug" "text",
    "email" "text",
    "phone" "text",
    "company" "text",
    "position" "text",
    "linkedin_url" "text",
    "facebook_url" "text",
    "portfolio_url" "text"
);


ALTER TABLE "public"."authors" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."allblogposts" AS
 SELECT "a"."id",
    "a"."title",
    "a"."slug",
    "a"."excerpt",
    "a"."content",
    "a"."category",
    "a"."featured",
    "a"."status",
    "a"."thumbnail_url",
    "a"."published_at",
    "a"."created_at",
    "a"."author_id",
    "au"."full_name" AS "author_name",
    "au"."avatar_url" AS "author_avatar"
   FROM ("public"."articles" "a"
     LEFT JOIN "public"."authors" "au" ON (("a"."author_id" = "au"."id")));


ALTER VIEW "public"."allblogposts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_form_fields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "field_key" "text" NOT NULL,
    "label" "text" NOT NULL,
    "field_type" "text" DEFAULT 'text'::"text" NOT NULL,
    "placeholder" "text",
    "help_text" "text",
    "options" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_required" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "width" "text" DEFAULT 'full'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."contact_form_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "email" "text",
    "phone" "text",
    "subject" "text",
    "message" "text",
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "admin_note" "text",
    "source" "text" DEFAULT 'lien-he'::"text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "video_url" "text",
    "modules" "jsonb" DEFAULT '[]'::"jsonb",
    "level" "text",
    "price" numeric,
    "featured" boolean DEFAULT false,
    "status" "text" DEFAULT 'published'::"text",
    "thumbnail_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gzvers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "company" "text" DEFAULT 'GZV'::"text",
    "position" "text",
    "avatar_url" "text",
    "cv_url" "text",
    "achievement_summary" "text",
    "testimonial" "text",
    "graduation_year" "text",
    "promotion_path" "text",
    "social_impact" "text",
    "course_taken" "text",
    "skills" "text"[] DEFAULT '{}'::"text"[],
    "achievements_list" "text"[] DEFAULT '{}'::"text"[],
    "mentoring_content" "text",
    "background" "jsonb" DEFAULT '{"education": "", "experience": "", "previous_role": ""}'::"jsonb",
    "social_links" "jsonb" DEFAULT '{"github": "", "website": "", "facebook": "", "linkedin": ""}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_director" boolean DEFAULT false
);


ALTER TABLE "public"."gzvers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_name" "text" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_type" "text",
    "file_size" integer,
    "bucket_name" "text" DEFAULT 'media'::"text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."media_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."media_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "file_name" "text",
    "file_url" "text" NOT NULL,
    "file_type" "text",
    "storage_path" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."media_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mentors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text",
    "avatar_url" "text",
    "description" "text",
    "specialties" "text"[] DEFAULT '{}'::"text"[],
    "teaching_subjects" "text"[] DEFAULT '{}'::"text"[],
    "practical_projects" "text"[] DEFAULT '{}'::"text"[],
    "research_projects" "text"[] DEFAULT '{}'::"text"[],
    "awards" "text"[] DEFAULT '{}'::"text"[],
    "tech_business_achievements" "text"[] DEFAULT '{}'::"text"[],
    "organizations" "jsonb" DEFAULT '[]'::"jsonb",
    "background" "jsonb" DEFAULT '{"education": "", "experience": ""}'::"jsonb",
    "linkedin_url" "text",
    "facebook_url" "text",
    "portfolio_url" "text",
    "email" "text",
    "phone" "text",
    "is_active" boolean DEFAULT true,
    "order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "visible_sections" "jsonb" DEFAULT '{"awards": true, "research": true, "teaching": true, "education": true, "practical": true, "experience": true, "specialties": true, "achievements": true}'::"jsonb"
);


ALTER TABLE "public"."mentors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."partners" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text" NOT NULL,
    "category" "text" DEFAULT 'corporate'::"text" NOT NULL,
    "website_url" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "partners_category_check" CHECK (("category" = ANY (ARRAY['corporate'::"text", 'education'::"text"])))
);


ALTER TABLE "public"."partners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'admin'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "email" "text",
    "status" "text" DEFAULT 'active'::"text",
    "slug" "text",
    "bio" "text",
    "personal_info" "jsonb" DEFAULT '{}'::"jsonb",
    "organization" "text"[],
    "education" "jsonb" DEFAULT '[]'::"jsonb",
    "work_history" "text"[],
    "subjects" "text"[],
    "practical_works" "text"[],
    "research_projects" "text"[],
    "awards" "text"[],
    "achievements" "text"[],
    "skills" "text"[],
    "social_impact" "text",
    "mentoring_info" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."program_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "program_id" "uuid",
    "title" "text",
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "registration_deadline" "date",
    "max_students" integer DEFAULT 20,
    "current_enrolled" integer DEFAULT 0,
    "status" "text" DEFAULT 'opening'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "program_schedules_status_check" CHECK (("status" = ANY (ARRAY['opening'::"text", 'full'::"text", 'ongoing'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."program_schedules" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."programs" AS
 SELECT "id",
    "title",
    "slug",
    "description",
    "video_url",
    "modules",
    "level",
    "price",
    "featured",
    "status",
    "thumbnail_url",
    "created_at",
    "thumbnail_url" AS "image"
   FROM "public"."courses"
  WHERE ("status" = 'published'::"text");


ALTER VIEW "public"."programs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text",
    "description" "text",
    "tech_stack" "text"[],
    "gallery" "text"[],
    "demo_url" "text",
    "featured" boolean DEFAULT false,
    "status" "text" DEFAULT 'completed'::"text",
    "thumbnail_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "detailproject" "text",
    "image" "text",
    "mentor_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "category" "text" DEFAULT 'Giáo dục'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "video_url" "text",
    "author_ids" "uuid"[] DEFAULT '{}'::"uuid"[],
    "hashtags" "text",
    "seo_title" "text",
    "seo_keywords" "text",
    "order_index" integer DEFAULT 0
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "text" NOT NULL,
    "permissions" "text"[] NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_core_values" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "color_code" "text",
    "display_order" integer DEFAULT 0
);


ALTER TABLE "public"."training_core_values" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."training_page_settings" (
    "id" "text" DEFAULT 'main_config'::"text" NOT NULL,
    "hero_title" "text" DEFAULT 'Chương trình Đào tạo'::"text",
    "hero_subtitle" "text" DEFAULT 'Khám phá các chương trình đào tạo chuyên nghiệp...'::"text",
    "stats" "jsonb" DEFAULT '[{"label": "Chương trình", "value": "50+"}, {"label": "Học viên", "value": "5000+"}]'::"jsonb",
    "benefit_title" "text" DEFAULT 'Tại sao chọn GZV?'::"text",
    "benefit_description" "text" DEFAULT 'Những lợi ích vượt trội khi học tập tại GZV'::"text",
    "cta_title" "text" DEFAULT 'Sẵn sàng bắt đầu hành trình?'::"text",
    "cta_description" "text" DEFAULT 'Để lại thông tin để được đội ngũ GZV tư vấn...'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."training_page_settings" OWNER TO "postgres";


ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."contact_form_fields"
    ADD CONSTRAINT "contact_form_fields_field_key_key" UNIQUE ("field_key");



ALTER TABLE ONLY "public"."contact_form_fields"
    ADD CONSTRAINT "contact_form_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_files"
    ADD CONSTRAINT "media_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."media_files"
    ADD CONSTRAINT "media_files_storage_path_key" UNIQUE ("storage_path");



ALTER TABLE ONLY "public"."authors"
    ADD CONSTRAINT "mentors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mentors"
    ADD CONSTRAINT "mentors_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."authors"
    ADD CONSTRAINT "mentors_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."mentors"
    ADD CONSTRAINT "mentors_slug_key1" UNIQUE ("slug");



ALTER TABLE ONLY "public"."gzvers"
    ADD CONSTRAINT "gzvers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gzvers"
    ADD CONSTRAINT "gzvers_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."partners"
    ADD CONSTRAINT "partners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."program_schedules"
    ADD CONSTRAINT "program_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_key" UNIQUE ("role");



ALTER TABLE ONLY "public"."training_core_values"
    ADD CONSTRAINT "training_core_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."training_page_settings"
    ADD CONSTRAINT "training_page_settings_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_authors_slug" ON "public"."authors" USING "btree" ("slug");



CREATE INDEX "idx_contact_messages_created_at" ON "public"."contact_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_contact_messages_status" ON "public"."contact_messages" USING "btree" ("status");



CREATE INDEX "idx_profiles_slug" ON "public"."profiles" USING "btree" ("slug");



CREATE INDEX "idx_projects_order_index" ON "public"."projects" USING "btree" ("order_index");



CREATE INDEX "idx_schedules_start_date" ON "public"."program_schedules" USING "btree" ("start_date");



CREATE OR REPLACE TRIGGER "trg_contact_form_fields_updated_at" BEFORE UPDATE ON "public"."contact_form_fields" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "trg_contact_messages_updated_at" BEFORE UPDATE ON "public"."contact_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "trg_partners_updated_at" BEFORE UPDATE ON "public"."partners" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_articles_modtime" BEFORE UPDATE ON "public"."articles" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_mentors_modtime" BEFORE UPDATE ON "public"."authors" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_mentors_new_modtime" BEFORE UPDATE ON "public"."mentors" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_gzver_modtime" BEFORE UPDATE ON "public"."gzvers" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_projects_modtime" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."media_assets"
    ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."role_permissions"("role") ON UPDATE CASCADE;



CREATE POLICY "Admin Delete" ON "public"."projects" FOR DELETE USING (true);



CREATE POLICY "Admin Insert" ON "public"."projects" FOR INSERT WITH CHECK (true);



CREATE POLICY "Admin Insert Access" ON "public"."articles" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Admin Media Manage" ON "public"."media_assets" TO "authenticated" USING (true);



CREATE POLICY "Admin Select" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Admin Update" ON "public"."projects" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Admins can delete partners" ON "public"."partners" FOR DELETE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'collab'::"text"])))));



CREATE POLICY "Admins can insert partners" ON "public"."partners" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'collab'::"text"])))));



CREATE POLICY "Admins can update partners" ON "public"."partners" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'collab'::"text"]))))) WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'collab'::"text"])))));



CREATE POLICY "Admins manage training core values" ON "public"."training_core_values" TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text")))) WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Admins manage training settings" ON "public"."training_page_settings" TO "authenticated" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text")))) WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Allow Insert for authenticated users" ON "public"."projects" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow Select for everyone" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Allow all for admin" ON "public"."authors" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all for admin on mentors" ON "public"."mentors" USING (true) WITH CHECK (true);



CREATE POLICY "Allow auth select mentors" ON "public"."authors" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow full access for authenticated users" ON "public"."articles" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow individual delete for admin" ON "public"."gzvers" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow individual insert" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow individual select" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Allow individual update" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Allow insert for all" ON "public"."projects" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public read access" ON "public"."gzvers" FOR SELECT USING (true);



CREATE POLICY "Allow public read for published articles" ON "public"."articles" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Allow select for all" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Allow select for everyone" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Anyone can submit a contact message" ON "public"."contact_messages" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated can delete contact messages" ON "public"."contact_messages" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated can manage contact fields" ON "public"."contact_form_fields" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated can read contact messages" ON "public"."contact_messages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated can update contact messages" ON "public"."contact_messages" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Cho phép sửa hồ sơ mentor" ON "public"."authors" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Enable delete for all users" ON "public"."articles" FOR DELETE USING (true);



CREATE POLICY "Enable insert for all users" ON "public"."articles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for all users" ON "public"."projects" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable select for all users" ON "public"."articles" FOR SELECT USING (true);



CREATE POLICY "Enable update for all users" ON "public"."articles" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for all users" ON "public"."authors" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Public Read Access" ON "public"."articles" FOR SELECT USING (true);



CREATE POLICY "Public Read Access" ON "public"."courses" FOR SELECT USING (true);



CREATE POLICY "Public Read Access" ON "public"."gzvers" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Public Read Access" ON "public"."media_files" FOR SELECT USING (true);



CREATE POLICY "Public Read Access" ON "public"."projects" FOR SELECT USING (true);



CREATE POLICY "Public Read gzvers" ON "public"."gzvers" FOR SELECT USING (true);



CREATE POLICY "Public View" ON "public"."courses" FOR SELECT USING (true);



CREATE POLICY "Public View Schedules" ON "public"."program_schedules" FOR SELECT USING (true);



CREATE POLICY "Public can read active contact fields" ON "public"."contact_form_fields" FOR SELECT USING (true);



CREATE POLICY "Public can view active partners" ON "public"."partners" FOR SELECT USING ((("is_active" = true) OR ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Public read training core values" ON "public"."training_core_values" FOR SELECT USING (true);



CREATE POLICY "Public read training settings" ON "public"."training_page_settings" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."authors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_form_fields" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gzvers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."media_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mentors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."partners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."program_schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_core_values" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."training_page_settings" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "anon";





































































































































































GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."articles" TO "authenticated";
GRANT SELECT ON TABLE "public"."articles" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."authors" TO "authenticated";
GRANT SELECT ON TABLE "public"."authors" TO "anon";



GRANT SELECT ON TABLE "public"."allblogposts" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."contact_form_fields" TO "authenticated";
GRANT SELECT ON TABLE "public"."contact_form_fields" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."contact_messages" TO "authenticated";
GRANT SELECT ON TABLE "public"."contact_messages" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."courses" TO "authenticated";
GRANT SELECT ON TABLE "public"."courses" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."gzvers" TO "authenticated";
GRANT SELECT ON TABLE "public"."gzvers" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."media_assets" TO "authenticated";
GRANT SELECT ON TABLE "public"."media_assets" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."media_files" TO "authenticated";
GRANT SELECT ON TABLE "public"."media_files" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."mentors" TO "authenticated";
GRANT SELECT ON TABLE "public"."mentors" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."partners" TO "authenticated";
GRANT SELECT ON TABLE "public"."partners" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."profiles" TO "authenticated";
GRANT SELECT ON TABLE "public"."profiles" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."program_schedules" TO "authenticated";
GRANT SELECT ON TABLE "public"."program_schedules" TO "anon";



GRANT SELECT ON TABLE "public"."programs" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."projects" TO "authenticated";
GRANT SELECT ON TABLE "public"."projects" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."role_permissions" TO "authenticated";
GRANT SELECT ON TABLE "public"."role_permissions" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."training_core_values" TO "authenticated";
GRANT SELECT ON TABLE "public"."training_core_values" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."training_page_settings" TO "authenticated";
GRANT SELECT ON TABLE "public"."training_page_settings" TO "anon";



































