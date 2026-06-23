-- Projects Management Tables

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  client_name TEXT,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('web', 'mobile', 'desktop', 'ai', 'blockchain', 'data')) NOT NULL,
  status TEXT CHECK (status IN ('planning', 'in-progress', 'on-hold', 'completed', 'cancelled')) DEFAULT 'planning',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  budget DECIMAL(12, 2),
  spent DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  team_size INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  completed_date DATE,
  technologies TEXT[],
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_projects_slug (slug),
  INDEX idx_projects_manager_id (manager_id),
  INDEX idx_projects_client_id (client_id),
  INDEX idx_projects_category (category),
  INDEX idx_projects_status (status),
  INDEX idx_projects_start_date (start_date)
);

-- Project team members table
CREATE TABLE IF NOT EXISTS public.project_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  responsibility TEXT,
  hours_allocated DECIMAL(10, 2),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_project_team_members_project_id (project_id),
  INDEX idx_project_team_members_user_id (user_id),
  UNIQUE(project_id, user_id)
);

-- Project milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_date DATE,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'at-risk')) DEFAULT 'pending',
  deliverables TEXT[],
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_milestones_project_id (project_id),
  INDEX idx_project_milestones_due_date (due_date)
);

-- Project tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('todo', 'in-progress', 'review', 'completed', 'blocked')) DEFAULT 'todo',
  estimated_hours DECIMAL(10, 2),
  actual_hours DECIMAL(10, 2),
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_tasks_project_id (project_id),
  INDEX idx_project_tasks_milestone_id (milestone_id),
  INDEX idx_project_tasks_assignee_id (assignee_id),
  INDEX idx_project_tasks_status (status),
  INDEX idx_project_tasks_due_date (due_date)
);

-- Project documents/files table
CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT CHECK (document_type IN ('specification', 'design', 'documentation', 'contract', 'report', 'other')),
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  uploaded_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  version_number INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_project_documents_project_id (project_id),
  INDEX idx_project_documents_uploaded_by_id (uploaded_by_id)
);

-- Create indexes
CREATE INDEX idx_projects_created_at ON public.projects(created_at);
CREATE INDEX idx_project_milestones_created_at ON public.project_milestones(created_at);
CREATE INDEX idx_project_tasks_created_at ON public.project_tasks(created_at);

-- Create triggers
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON public.project_milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON public.project_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_documents_updated_at BEFORE UPDATE ON public.project_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,             -- Chức danh (VD: Senior Mentor)
    avatar_url TEXT,
    type TEXT DEFAULT 'mentor', -- Để phân biệt 'gzver' hay 'mentor' phục vụ việc trỏ Link
    bio TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Thêm Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_authors_slug ON public.authors(slug);


-- Thêm cột số thứ tự sắp xếp vào bảng projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Tạo index để tối ưu tốc độ truy vấn theo thứ tự
CREATE INDEX IF NOT EXISTS idx_projects_order_index ON public.projects(order_index ASC);