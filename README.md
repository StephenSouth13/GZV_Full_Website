# 🎓 MSC Project — Life Long Learning Platform

Dự án **MSC Center** gồm 2 ứng dụng Next.js 14 độc lập, dùng chung một database Supabase:

| Module | Đường dẫn | Vai trò | Domain (production) |
|---|---|---|---|
| **Frontend** | `Frontend_MSC/` | Website công khai cho học viên, mentor, khách | `msc.edu.vn` |
| **Backend** | `Backend_MSC/`  | Admin Dashboard (CMS) + REST API | `api.msc.edu.vn` |
| **Database** | Supabase (PostgreSQL + Storage + Auth) | Nguồn dữ liệu duy nhất | project ref: `yyqajxbkxiddfqnzkcmr` |

> Hai ứng dụng "ăn khớp" với nhau qua **Supabase chung**: Backend quản trị nội dung (admin), Frontend đọc/ghi dữ liệu công khai. Một số tính năng quản trị nhạy cảm đi qua REST API của Backend (`/api/*`).
> Nói chung nhiều khi code cũng mệt vcl ra.
---

## 📁 Cấu trúc Monorepo

```
.
├── Frontend_MSC/              # Public website (msc.edu.vn)
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # Trang chủ
│   │   ├── gioi-thieu/        # Giới thiệu
│   │   ├── dao-tao/           # Đào tạo / khóa học
│   │   ├── du-an/             # Dự án
│   │   ├── tin-tuc/           # Blog / bài viết
│   │   ├── mentors/           # Danh sách Mentor
│   │   ├── mscer/             # Cộng đồng MSCer
│   │   ├── dong-hanh/         # Đối tác đồng hành
│   │   ├── lien-he/           # Liên hệ
│   │   ├── login/  register/  profile/  cv/  student/
│   │   └── chinh-sach-bao-mat/ dieu-khoan-su-dung/ so-do-trang-web/
│   ├── components/            # UI components (shadcn/ui + custom)
│   ├── contexts/              # React Context (auth, theme…)
│   ├── hooks/                 # Custom hooks
│   ├── lib/
│   │   ├── api-supabase.ts    # Supabase browser client + data helpers
│   │   └── storage.ts         # Helper bucket "media"
│   ├── middleware.ts          # Auth middleware (Supabase SSR)
│   └── public/                # Tài nguyên tĩnh
│
├── Backend_MSC/               # Admin CMS + REST API (api.msc.edu.vn)
│   ├── app/
│   │   ├── admin-login/       # Trang đăng nhập admin
│   │   ├── admin/             # Dashboard quản trị
│   │   │   ├── dashboard/     # Thống kê tổng quan
│   │   │   ├── users/         # Quản lý users / profiles
│   │   │   ├── authors/       # Tác giả
│   │   │   ├── articles/      # Bài viết / blog
│   │   │   ├── courses/       # Khóa học
│   │   │   ├── projects/      # Dự án
│   │   │   ├── mentors/       # Mentor
│   │   │   ├── mscers/        # MSCers
│   │   │   ├── training/      # Trang đào tạo (CMS)
│   │   │   ├── finance/       # Tài chính
│   │   │   └── images/        # Media library (Cloudinary)
│   │   └── api/
│   │       ├── auth/login,verify   # JWT auth qua Supabase
│   │       ├── images/             # Upload / quản lý ảnh (Cloudinary)
│   │       └── health/             # Health check
│   ├── lib/
│   │   ├── supabase.ts        # Server + admin client
│   │   ├── api-auth.ts        # Middleware xác thực JWT
│   │   ├── cors.ts            # Whitelist domain frontend
│   │   ├── cloudinary.ts      # Cloudinary SDK
│   │   └── *-service.ts       # Business logic (blog, training, member, user)
│   ├── sql/                   # Schema PostgreSQL (chạy theo thứ tự 01 → 13)
│   ├── docs/
│   │   ├── API.md             # Tài liệu REST API
│   │   └── FRONTEND_INTEGRATION.md
│   └── SETUP_GUIDE.md
│
└── supabase/                  # Quản lý migration tập trung qua Lovable Cloud
    └── config.toml
```

---

## 🧱 Tech Stack

**Frontend & Backend (chung):** Next.js 14 (App Router) · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui + Radix · Framer Motion · React Hook Form + Zod · Lucide Icons · pnpm 10

**Khác biệt:**
- **Frontend**: `@supabase/ssr` (auth SSR), `react-markdown`, `html2pdf.js` (xuất CV), `qrcode.react`
- **Backend**: `@tanstack/react-table` (admin tables), **Tiptap 3** (rich text editor), `react-dropzone`, **Cloudinary** (media), `sonner` (toast)

**Hạ tầng:** Supabase (PostgreSQL 15 + Auth + Storage bucket `media`) · Cloudinary (CDN ảnh) · Vercel (deploy)

---

## 🔌 Kiến trúc kết nối Frontend ↔ Backend

```text
┌──────────────────────┐        ┌────────────────────────┐
│  Frontend (msc.edu.vn)│        │ Backend Admin/API      │
│  Next.js 14           │        │ (api.msc.edu.vn)       │
│                       │        │ Next.js 14             │
│  - Đọc dữ liệu công   │◀──────▶│  - /admin (CMS)        │
│    khai trực tiếp     │  REST  │  - /api/auth/*         │
│    qua Supabase JS    │  /api  │  - /api/images/*       │
│  - Auth qua Supabase  │        │  - service-role key    │
└──────────┬────────────┘        └──────────┬─────────────┘
           │                                │
           │     anon key (RLS bảo vệ)      │  service_role key
           ▼                                ▼
       ┌────────────────────────────────────────────┐
       │   Supabase  (Postgres + Auth + Storage)    │
       │   bucket: media   |   schema: public       │
       └────────────────────────────────────────────┘
                            ▲
                            │ public URL
                       ┌────┴─────┐
                       │Cloudinary│  (upload ảnh từ Backend Admin)
                       └──────────┘
```

**Nguyên tắc đồng bộ:**
1. **Một database duy nhất** — cả 2 app chỉ trỏ về cùng `NEXT_PUBLIC_SUPABASE_URL`.
2. **RLS làm gốc bảo mật** — Frontend dùng `anon key`, tất cả bảng đều bật Row Level Security.
3. **Backend nắm `service_role_key`** — chỉ dùng phía server để bypass RLS khi cần ghi từ admin / edge logic.
4. **Storage thống nhất** — bucket `media` (public). Upload ảnh đi qua Backend `/api/images/upload` (Cloudinary) hoặc trực tiếp Supabase Storage.
5. **Auth chia sẻ** — JWT do Supabase phát hành dùng được trên cả 2 app; Backend `verify` qua `/api/auth/verify`.

---

## 🗄️ Database Schema

Chạy lần lượt các file trong `Backend_MSC/sql/` (theo số thứ tự):

| File | Nội dung |
|---|---|
| `01-users.sql` | `profiles`, `user_preferences`, `user_activity`, `role_permissions` |
| `02-articles.sql` (+updated) | `articles`, `article_comments`, `article_analytics`, `article_categories` |
| `03-courses.sql` (+updated) | `courses`, `course_modules`, `course_lessons`, `course_enrollments`, `user_lesson_progress`, `course_reviews` |
| `04-projects.sql` (+updated) | `projects`, `project_team_members`, `project_milestones`, `project_tasks`, `project_documents` |
| `05-finance.sql` | `transactions` |
| `06-media.sql`, `07-media-storage.sql` | `media_assets`, `media_files` + bucket policies |
| `08-profiles.sql` | Mở rộng `profiles` |
| `09-author.sql` | `authors` |
| `10.mscers.sql` | `mscers` |
| `11-mentors.sql` | `mentors` |
| `12-MSCersSection.sql`, `13-DirectorsSection.SQL` | Section CMS trang giới thiệu |

Bảng đã tồn tại hiện tại (Supabase): `articles, authors, courses, media_assets, media_files, mentors, mscers, profiles, program_schedules, programs, projects, role_permissions, training_core_values, training_page_settings`.

---

## ⚙️ Cài đặt & Chạy local

### Yêu cầu
- Node.js ≥ 18
- pnpm ≥ 10
- Tài khoản Supabase + (tuỳ chọn) Cloudinary

### 1. Cài dependencies (chạy ở **mỗi** sub-project)

```bash
cd Frontend_MSC && pnpm install
cd ../Backend_MSC && pnpm install
```

### 2. Cấu hình môi trường

**`Frontend_MSC/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://yyqajxbkxiddfqnzkcmr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_API_URL=http://localhost:3001        # URL của Backend
```

**`Backend_MSC/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://yyqajxbkxiddfqnzkcmr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=...                    # ⚠️ KHÔNG đưa lên frontend
SUPABASE_JWT_SECRET=...

ALLOWED_ORIGINS=http://localhost:3000,https://msc.edu.vn

# Cloudinary (tuỳ chọn — bật tính năng upload ảnh)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

SESSION_SECRET=change-me
```

### 3. Khởi tạo database

Mở **Supabase Dashboard → SQL Editor**, chạy lần lượt các file trong `Backend_MSC/sql/` (01 → 13).

Tạo admin user:
```sql
INSERT INTO public.profiles (id, email, full_name, role, status)
VALUES ('<auth-user-uuid>', 'admin@msc.edu.vn', 'Admin', 'admin', 'active');
```

### 4. Chạy dev server (2 cổng song song)

```bash
# Terminal 1 — Frontend
cd Frontend_MSC && pnpm dev          # http://localhost:3000

# Terminal 2 — Backend (Admin + API)
cd Backend_MSC && pnpm dev -p 3001   # http://localhost:3001
```

Truy cập:
- 🌐 Frontend: <http://localhost:3000>
- 🛠️ Admin CMS: <http://localhost:3001/admin-login>
- 📡 API health: <http://localhost:3001/api/health>

---

## 🔐 REST API (Backend)

Base URL: `https://api.msc.edu.vn`

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập email + password → trả `access_token`, `refresh_token` |
| `GET`  | `/api/auth/verify` | Xác thực JWT, trả profile + role |
| `GET`  | `/api/health` | Health check |
| `POST` | `/api/images/upload` | Upload ảnh (multipart) → Cloudinary |
| `GET`  | `/api/images` | Danh sách ảnh + folders |
| `GET`  | `/api/images/stats` | Thống kê dung lượng |
| `DELETE` | `/api/images/[publicId]` | Xoá ảnh |

Headers chung:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

Định dạng response chuẩn:
```json
{ "success": true, "data": { ... }, "message": "..." }
{ "success": false, "error": "...", "code": "ERROR_CODE" }
```

Xem chi tiết: `Backend_MSC/docs/API.md` và `Backend_MSC/docs/FRONTEND_INTEGRATION.md`.

---

## 🚀 Deploy

| Phần | Nền tảng đề xuất | Domain |
|---|---|---|
| Frontend | Vercel | `msc.edu.vn` |
| Backend  | Vercel (project riêng) | `api.msc.edu.vn` |
| DB / Auth / Storage | Supabase | — |
| Media CDN | Cloudinary | — |

Sau khi deploy, **đảm bảo:**
- `ALLOWED_ORIGINS` ở Backend liệt kê đúng domain Frontend.
- Frontend `NEXT_PUBLIC_API_URL` trỏ vào `https://api.msc.edu.vn`.
- Supabase → Authentication → URL Configuration thêm Redirect URLs cho cả 2 domain.

---

## 📚 Tham khảo thêm
- `Backend_MSC/SETUP_GUIDE.md` — hướng dẫn setup chi tiết
- `Backend_MSC/docs/API.md` — đặc tả API
- `Backend_MSC/docs/FRONTEND_INTEGRATION.md` — code mẫu tích hợp
- `Backend_MSC/sql/README.md` — mô tả schema
- `Frontend_MSC/README.md` — chi tiết feature frontend

---

## 📝 License

© MSC Center — Life Long Learning. Nội bộ sử dụng cho dự án `msc.edu.vn`.
