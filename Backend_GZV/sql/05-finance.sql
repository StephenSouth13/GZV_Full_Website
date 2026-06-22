-- Finance and Transaction Management Tables

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT CHECK (transaction_type IN ('income', 'expense', 'transfer', 'refund')) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  subcategory TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'bank_transfer', 'paypal', 'stripe', 'cash', 'check', 'other')) DEFAULT 'bank_transfer',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')) DEFAULT 'pending',
  reference_id TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  notes TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  INDEX idx_transactions_transaction_type (transaction_type),
  INDEX idx_transactions_category (category),
  INDEX idx_transactions_status (status),
  INDEX idx_transactions_user_id (user_id),
  INDEX idx_transactions_created_at (created_at)
);

-- Invoice table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  issued_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  description TEXT,
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_terms TEXT,
  notes TEXT,
  terms_conditions TEXT,
  line_items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_invoices_invoice_number (invoice_number),
  INDEX idx_invoices_client_id (client_id),
  INDEX idx_invoices_status (status),
  INDEX idx_invoices_due_date (due_date)
);

-- Expense table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  vendor TEXT,
  submitted_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid')) DEFAULT 'draft',
  receipt_url TEXT,
  receipt_file_url TEXT,
  date DATE NOT NULL,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_expenses_category (category),
  INDEX idx_expenses_status (status),
  INDEX idx_expenses_submitted_by_id (submitted_by_id),
  INDEX idx_expenses_project_id (project_id),
  INDEX idx_expenses_date (date)
);

-- Financial budget table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  period TEXT CHECK (period IN ('monthly', 'quarterly', 'yearly')) DEFAULT 'yearly',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  spent_amount DECIMAL(12, 2) DEFAULT 0,
  remaining_amount DECIMAL(12, 2),
  status TEXT CHECK (status IN ('active', 'inactive', 'exceeded')) DEFAULT 'active',
  created_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_budgets_category (category),
  INDEX idx_budgets_period (period),
  INDEX idx_budgets_status (status)
);

-- Financial report/summary table
CREATE TABLE IF NOT EXISTS public.financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('monthly', 'quarterly', 'yearly', 'custom')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_expenses DECIMAL(12, 2) DEFAULT 0,
  total_profit DECIMAL(12, 2) DEFAULT 0,
  revenue_by_category JSONB,
  expenses_by_category JSONB,
  generated_by_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_financial_reports_period_start (period_start),
  INDEX idx_financial_reports_period_end (period_end)
);

-- Transaction categories
CREATE TABLE IF NOT EXISTS public.transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_transactions_updated_at ON public.transactions(updated_at);
CREATE INDEX idx_invoices_created_at ON public.invoices(created_at);
CREATE INDEX idx_expenses_created_at ON public.expenses(created_at);
CREATE INDEX idx_budgets_created_at ON public.budgets(created_at);

-- Create triggers
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_reports_updated_at BEFORE UPDATE ON public.financial_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transaction_categories_updated_at BEFORE UPDATE ON public.transaction_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default expense categories
INSERT INTO public.transaction_categories (name, type, description) VALUES
  ('Salaries', 'expense', 'Employee salaries and wages'),
  ('Infrastructure', 'expense', 'Cloud hosting, servers, and infrastructure'),
  ('Marketing', 'expense', 'Marketing campaigns and advertising'),
  ('Software', 'expense', 'Software licenses and subscriptions'),
  ('Office', 'expense', 'Office supplies and equipment'),
  ('Travel', 'expense', 'Business travel expenses'),
  ('Course Sales', 'income', 'Revenue from course enrollments'),
  ('Project Revenue', 'income', 'Revenue from project completions'),
  ('Consultation', 'income', 'Consulting service revenue')
ON CONFLICT (name) DO NOTHING;
