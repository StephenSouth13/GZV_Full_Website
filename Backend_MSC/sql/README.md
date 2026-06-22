# Database Schema Documentation

This directory contains SQL schema files for the MSC project database. Each file is numbered and represents a logical group of related tables.

## Files Overview

### 01-users.sql
**User Management and Authentication**
- `profiles` - Extended user profiles (beyond Supabase auth)
- `user_preferences` - User-specific settings and preferences
- `user_activity` - Activity logging for audit trails
- `role_permissions` - Role-based access control definitions

### 02-articles.sql
**Articles and Blog Management**
- `articles` - Blog post content
- `article_comments` - Reader comments
- `article_analytics` - View tracking and analytics
- `article_categories` - Content categories

### 03-courses.sql
**Learning Management System**
- `courses` - Course definitions
- `course_modules` - Course sections/modules
- `course_lessons` - Individual lessons
- `course_enrollments` - Student enrollments
- `user_lesson_progress` - Learning progress tracking
- `course_reviews` - Student reviews and ratings

### 04-projects.sql
**Project Management**
- `projects` - Project definitions
- `project_team_members` - Team assignments
- `project_milestones` - Project phases
- `project_tasks` - Individual tasks
- `project_documents` - Project files and documentation

### 05-finance.sql
**Finance and Accounting**
- `transactions` - All financial transactions
- `invoices` - Customer invoices
- `expenses` - Expense tracking
- `budgets` - Budget planning
- `financial_reports` - Financial summaries
- `transaction_categories` - Transaction classifications

### 06-media.sql
**Media and File Management**
- `media_files` - File storage and metadata
- `media_folders` - File organization
- `media_usage` - Track where media is used
- `media_variants` - Image optimization variants
- `media_trash` - Soft delete management
- `media_storage_quotas` - Storage quota tracking

## Key Features

### Timestamps
All tables include `created_at` and `updated_at` timestamps with automatic triggers.

### Foreign Keys
All relationships are properly defined with `ON DELETE` constraints:
- `CASCADE` - Delete child records when parent is deleted
- `SET NULL` - Clear reference when parent is deleted
- `RESTRICT` - Prevent deletion if children exist

### Indexes
Optimized with indexes on:
- Foreign key columns
- Frequently searched/filtered columns
- Date range queries
- Status fields

### Soft Deletes
Media system includes soft delete support via `deleted_at` field.

### Enums/Constraints
Check constraints enforce data integrity for status fields and other enums.

## Installation

1. Connect to your Supabase project
2. Execute each SQL file in order (01, 02, 03, 04, 05, 06)
3. Enable RLS (Row Level Security) if needed

## RLS Policies (To be implemented)

For production, implement Row Level Security:
- Users can only see their own profile
- Only admins can delete users
- Users can only edit their own content
- Course content is visible based on enrollment status

## Extensions Required

- `uuid-ossp` - For UUID generation
- `pg_trgm` - For full-text search (optional)
- `pgcrypto` - For cryptographic functions (optional)

## Relationships Diagram

```
profiles (users)
├── user_preferences
├── user_activity
├── articles (author_id)
│   ├── article_comments
│   └── article_analytics
├── courses (instructor_id)
│   ├── course_modules
│   │   └── course_lessons
│   ├── course_enrollments (user_id)
│   │   └── user_lesson_progress
│   └── course_reviews (user_id)
├── projects (manager_id)
│   ├── project_team_members (user_id)
│   ├── project_milestones
│   │   └── project_tasks (assignee_id)
│   └── project_documents (uploaded_by_id)
├── transactions (user_id)
├── invoices (issued_by_id, client_id)
├── expenses (submitted_by_id, approved_by_id)
├── budgets (created_by_id)
├── financial_reports (generated_by_id)
└── media_files (uploaded_by_id)
    ├── media_usage
    ├── media_variants
    └── media_trash
```

## Notes

- All monetary amounts use DECIMAL(12,2) for precision
- Timestamps use `TIMESTAMP WITH TIME ZONE` for consistency
- JSON fields (JSONB) are used for flexible metadata storage
- Array fields store related values (e.g., tags, technologies)
