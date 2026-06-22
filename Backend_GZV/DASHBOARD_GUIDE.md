# Admin Dashboard - Hướng Dẫn Hoàn Chỉnh

## 📋 Tổng Quan

Admin Dashboard đã được cập nhật hoàn toàn với các tính năng hiện đại, giao diện tuyệt đẹp, hỗ trợ Dark Mode, và Responsive Design cho Mobile.

## ✨ Các Tính Năng Chính

### 1. **Dashboard Chính** (`/admin/dashboard`)
- 📊 KPI Cards hiển thị các chỉ số quan trọng
- 📈 Biểu đồ doanh thu và tăng trưởng người dùng
- 📋 Danh sách hoạt động gần đây
- 📊 Thống kê nhanh hệ thống
- ✨ Animations mượt mà với Framer Motion
- 📱 Fully responsive trên tất cả thiết bị

### 2. **Hồ Sơ Người Dùng** (`/admin/profile`)
- 👤 Hiển thị thông tin cá nhân
- ✏️ Chỉnh sửa hồ sơ
- 📧 Hiển thị email, điện thoại, vị trí
- 🌐 Website link
- 📝 Tiểu sử cá nhân
- 🔐 Bảo mật thông tin theo role

### 3. **Cài Đặt** (`/admin/settings`)
Chia thành 4 tab chính:

#### Tab 1: Thông Báo (Notifications)
- 📧 Email Notifications
- 🔔 Push Notifications
- 💬 SMS Notifications
- 📢 Marketing Emails
- ⚠️ Security Alerts
- 📝 Activity Log

#### Tab 2: Bảo Mật (Security)
- 🔐 Thay đổi mật khẩu
- 🛡️ Xác thực hai yếu tố (2FA)
- 🚪 Đăng xuất tất cả thiết bị

#### Tab 3: Riêng Tư (Privacy)
- 🌐 Hồ sơ công khai
- 🔍 Hiển thị trong tìm kiếm
- 💾 Quản lý dữ liệu
- 📥 Tải xuống dữ liệu
- 🗑️ Xóa tài khoản

#### Tab 4: Giao Diện (Appearance)
- 🌓 Chọn chủ đề (Light/Dark/System)
- 📏 Điều chỉnh kích thước font
- 🎨 Tùy chỉnh giao diện

## 🎨 Thiết Kế & Giao Diện

### Dark Mode
- ✅ Hỗ trợ dark mode hoàn toàn
- 🌓 Tự động chuyển đổi theo hệ thống
- 💾 Lưu tùy chọn người dùng

### Responsive Design
- 📱 Mobile: < 768px (1 cột)
- 💻 Tablet: 768px - 1024px (2 cột)
- 🖥️ Desktop: > 1024px (4 cột)
- ✨ Sidebar tự động ẩn/hiện trên mobile

### Glassmorphism Effects
- 🌫️ Backdrop blur cho thẻ
- ✨ Semi-transparent backgrounds
- 🎯 Modern gradient overlays

## 🧭 Điều Hướng (Navigation)

### Sidebar Menu
```
├── Bảng điều khiển
├── Chương trình Đào tạo
├── Quản lý MSCers
├── Quản lý Mentors
├── Danh mục tác giả
├── Tin nhắn liên hệ
├── Dự án
├── Bài viết
├── Quản lý hình ảnh
├── Quản lý người dùng (Admin only)
├── Tài chính (Admin only)
├── [Separator]
├── Hồ sơ
└── Cài đặt
```

### Header Features
- 🌙 Nút chuyển đổi Dark Mode
- 🔔 Thông báo (trên desktop)
- 👤 User Menu:
  - Hồ sơ
  - Cài đặt
  - Đăng xuất

## 🚀 Cách Sử Dụng

### Đi tới Dashboard
```
http://localhost:3000/admin/dashboard
```

### Truy cập Hồ sơ
```
http://localhost:3000/admin/profile
```

### Truy cập Cài đặt
```
http://localhost:3000/admin/settings
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes
- **Toast**: Sonner
- **Auth**: Supabase

## 📱 Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { /* sm */ }

/* Tablet */
@media (max-width: 768px) { /* md */ }

/* Desktop */
@media (max-width: 1024px) { /* lg */ }

/* Large Desktop */
@media (max-width: 1280px) { /* xl */ }
```

## 🎯 Performance

- ⚡ Lazy loading cho components
- 📦 Code splitting tự động
- 🖼️ Image optimization
- ✅ SEO-friendly
- 🎭 Smooth animations

## 🔐 Bảo Mật

- ✅ Protected routes với role-based access
- 🔐 Password hashing
- 📝 Activity logging
- 🛡️ CSRF protection
- 🔒 Secure session management

## 🌐 Đa Ngôn Ngữ

- 🇻🇳 Vietnamese (VI)
- 🇺🇸 English (EN) - có thể mở rộng

## 📊 Dữ Liệu

### KPI Data
```javascript
{
  title: 'Tổng số người dùng',
  value: '3,150',
  change: '+12% so với tháng trước',
  changeType: 'positive',
  icon: Users,
  iconColor: 'text-blue-600'
}
```

## 🎨 Color Palette

- **Primary Blue**: `#0C3C78`
- **Accent Orange**: `#F7931E`
- **Success Green**: `#10B981`
- **Danger Red**: `#EF4444`
- **Warning Yellow**: `#F59E0B`

## 📈 Điều Hướng Workflow

```
Login (/admin-login)
    ↓
Dashboard (/admin/dashboard)
    ├── Profile (/admin/profile)
    ├── Settings (/admin/settings)
    └── Other Pages (dự án, bài viết, v.v.)
```

## 🔄 State Management

- localStorage: User settings, role
- React hooks: UI state
- Framer Motion: Animation state

## 📝 Custom Hooks

Sử dụng custom hooks cho:
- `useTheme` - Dark mode
- `useRouter` - Navigation
- `usePathname` - Active menu

## 🚨 Error Handling

- Toast notifications (Sonner)
- Error boundaries
- Fallback states
- Loading states

## 💡 Best Practices

1. **Responsive First**: Thiết kế mobile trước
2. **Performance**: Optimize images, lazy load
3. **Accessibility**: WCAG 2.1 compliant
4. **User Experience**: Smooth animations, clear feedback
5. **Code Quality**: TypeScript, ESLint, Prettier

## 🔧 Tùy Chỉnh

### Thay đổi Màu Sắc
Chỉnh sửa `tailwind.config.ts`:
```typescript
colors: {
  primary: { /* your colors */ },
  accent: { /* your colors */ }
}
```

### Thêm Menu Item
Chỉnh sửa `AdminSidebar.tsx`:
```typescript
const adminMenuItems = [
  {
    title: 'Tên menu',
    href: '/admin/path',
    icon: IconName,
    roles: ['admin', 'collab']
  }
]
```

## 📚 File Structure

```
Backend_MSC/
├── app/admin/
│   ├── dashboard/page.tsx
│   ├── profile/page.tsx
│   ├── settings/page.tsx
│   └── layout.tsx
├── components/admin/
│   ├── AdminLayout.tsx
│   ├── AdminHeader.tsx
│   ├── AdminSidebar.tsx
│   └── dashboard/
│       ├── KPICard.tsx
│       ├── RevenueChart.tsx
│       └── UserGrowthChart.tsx
└── lib/
    └── supabase.ts
```

## 📞 Support

Cần hỗ trợ? Liên hệ team phát triển hoặc kiểm tra documentation.

---

**Version**: 2.5.0
**Last Updated**: 2024
**Status**: Production Ready ✅
