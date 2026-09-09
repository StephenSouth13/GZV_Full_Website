# 🚀 GZV Growth Framework
\
## Enterprise Modular Growth System Documentation
       
> **Version:** GZV Core v1.0
> **Architecture:** Modular Monorepo
> **Philosophy:** *Decoupled by Design, Unified by Data*
> **Purpose:** Build once. Clone infinitely. Scale without limits. 

---

# 🌟 Executive Summary

GZV Growth Framework là nền tảng tăng trưởng số được thiết kế nhằm phục vụ chiến lược triển khai hàng trăm đến hàng nghìn website, landing page và hệ thống quản trị chỉ từ một bộ khung chuẩn hóa duy nhất.

Kiến trúc được xây dựng theo mô hình **Modular Monorepo Architecture**, cho phép:

* Triển khai cực nhanh
* Bảo trì dễ dàng
* Mở rộng linh hoạt
* Chuẩn hóa toàn bộ quy trình vận hành
* Đồng bộ dữ liệu theo thời gian thực

Toàn bộ hệ thống được vận hành trên nguyên tắc:

> **"Decoupled by Design, Unified by Data."**

Các ứng dụng được tách biệt về mặt triển khai nhưng kết nối với nhau thông qua một lớp dữ liệu trung tâm duy nhất.

---

# 🏛 System Architecture

## Core Components

| Module         | Responsibility                 | Technology                            |
| -------------- | ------------------------------ | ------------------------------------- |
| Frontend       | Public Website / Landing Pages | Next.js 14 + Tailwind CSS + Shadcn/UI |
| Backend        | CMS, CRM, Automation Hub       | Next.js 14 + API Routes               |
| Database       | Central Data Platform          | PostgreSQL 15 (Supabase)              |
| Authentication | User & Role Management         | Supabase Auth                         |
| Storage        | Media & Assets                 | Supabase Storage                      |
| Automation     | Growth & Workflow Engine       | n8n / Edge Functions                  |
| Deployment     | CI/CD Platform                 | Vercel                                |

---

# 📁 Repository Structure

```plaintext
GZV_1/
│
├── Frontend/              # Public Website
│
├── Backend/               # CMS + CRM + Automation APIs
│
├── supabase/              # Database Migrations
│
├── shared/                # Shared Types & Utilities
│
├── docs/                  # Documentation
│
└── scripts/               # Deployment & Automation Scripts
```

---

# 🔌 Data Flow Architecture

## Frontend Layer

Frontend đóng vai trò là lớp tương tác trực tiếp với khách hàng.

Nhiệm vụ:

* Hiển thị nội dung
* Thu thập Leads
* Đăng ký dịch vụ
* Theo dõi hành vi người dùng
* Kết nối API công khai

Frontend giao tiếp với Supabase thông qua:

```typescript
createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
```

### Security Layer

Toàn bộ dữ liệu được bảo vệ bởi:

* Row Level Security (RLS)
* JWT Validation
* Access Policies

RLS hoạt động như:

> "Data Security Police Officer"

Mọi truy cập trái phép đều bị từ chối ở tầng Database.

---

## Backend Layer

Backend là trung tâm xử lý nghiệp vụ.

Bao gồm:

### CMS Engine

Quản lý:

* Pages
* Blogs
* Landing Pages
* SEO Metadata

### CRM Engine

Quản lý:

* Leads
* Customers
* Activities
* Sales Pipeline

### Automation Engine

Xử lý:

* Email Automation
* Lead Nurturing
* Conversion Tracking
* Follow-up Sequences

Backend sử dụng:

```env
SUPABASE_SERVICE_ROLE_KEY
```

để thực hiện các tác vụ quyền cao.

---

## Database Layer

Supabase đóng vai trò:

### Single Source of Truth

Mọi hệ thống đều đọc và ghi dữ liệu từ cùng một nguồn.

Bao gồm:

* PostgreSQL 15
* Realtime Engine
* Authentication
* Storage
* Edge Functions

Lợi ích:

* Không đồng bộ dữ liệu thủ công
* Không phát sinh sai lệch
* Dễ backup
* Dễ nhân bản

---

# ⚙️ Core Environment Configuration

## Supabase Core

```env
# Project: GZV_1

NEXT_PUBLIC_SUPABASE_URL=https://fowjalibpmzyeyjcgbrx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

---

## Growth Infrastructure

```env
NEXT_PUBLIC_API_URL=https://api.gzv.one
```

---

# 📡 Growth Automation Layer

## Event Flow

```plaintext
Visitor
   ↓
Landing Page
   ↓
Lead Form
   ↓
API Endpoint
   ↓
Supabase
   ↓
n8n Workflow
   ↓
Email Automation
   ↓
CRM Tracking
```

---

## Automation Capabilities

### Lead Capture

* Form Submission
* Chatbot Collection
* Webinar Registration

### Lead Nurturing

* Email Sequences
* SMS Campaigns
* Remarketing Flows

### Customer Journey Tracking

* Acquisition
* Activation
* Retention
* Revenue
* Referral

---

# 🔥 Standardized REST API

## Lead Collection

```http
POST /api/growth/lead
```

Purpose:

* Capture landing page leads
* Trigger automation workflows
* Store CRM records

---

## CRM Synchronization

```http
POST /api/crm/sync
```

Purpose:

* Synchronize customer records
* Update pipeline stages
* Refresh engagement metrics

---

## System Health Monitoring

```http
GET /api/system/health
```

Response:

```json
{
  "status": "healthy",
  "database": "connected",
  "automation": "active",
  "version": "1.0.0"
}
```

---

# 🎨 Design System Standardization

## Official Brand Theme

### Primary Navy

```css
#071D49
```

### Growth Red

```css
#E11D48
```

### Neutral White

```css
#FFFFFF
```

### Background

```css
#F8FAFC
```

---

# ⚡ Performance Standards

Every GZV deployment must achieve:

| Metric           | Target |
| ---------------- | ------ |
| Lighthouse Score | 95+    |
| LCP              | < 1.5s |
| CLS              | < 0.1  |
| FCP              | < 1.0s |
| SEO Score        | 100    |
| Accessibility    | 95+    |

---

# 🚀 The "1000 Websites" Deployment Framework

Triển khai dự án mới chỉ cần 4 bước:

## Step 1 — Provision Database

```bash
supabase db push
```

Import toàn bộ migration từ:

```plaintext
supabase/migrations/
```

---

## Step 2 — Configure Environment

Điền:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## Step 3 — Apply Branding

Copy:

```plaintext
theme-gzv.css
```

ghi đè vào:

```plaintext
styles.css
```

---

## Step 4 — Deploy

```bash
git push origin main
```

Vercel sẽ tự động:

* Build
* Deploy
* Generate Preview
* Publish Production

---

# 🛠 Technology Stack

## Frontend

* Next.js 14 App Router
* React 19
* TypeScript
* Tailwind CSS
* Shadcn/UI
* Framer Motion

---

## Backend

* Next.js API Routes
* Server Actions
* Edge Runtime

---

## Database

* PostgreSQL 15
* Supabase Auth
* Supabase Storage
* Supabase Realtime

---

## Growth Stack

* n8n
* Edge Functions
* Webhooks
* Email Automation

---

## DevOps

* GitHub
* Vercel
* Supabase
* CI/CD Pipelines

---

# 🧭 Strategic Vision

GZV không chỉ là một website framework.

Đây là một **Growth Operating System** được thiết kế để:

* Clone hàng nghìn dự án
* Quản trị tập trung
* Tự động hóa quy trình tăng trưởng
* Chuẩn hóa triển khai doanh nghiệp
* Xây dựng hệ sinh thái Digital Assets quy mô lớn

---

# 📜 Founder's Note

> Hệ thống được tạo ra với mục tiêu tối đa hóa tốc độ triển khai, giảm chi phí vận hành và chuẩn hóa mọi quy trình tăng trưởng.
>
> Mỗi website không còn là một dự án riêng lẻ.
>
> Mỗi website là một node trong cùng một Growth Ecosystem.
>
> **Build Once. Deploy Forever. Scale Infinitely.**
>
> — GZV Growth Framework
