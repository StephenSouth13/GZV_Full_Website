# Admin Dashboard Components Guide

## Overview

This guide provides examples of how to use and create responsive components in the Admin Dashboard.

## 📦 Available Components

### Core Layout Components

#### AdminLayout
The main layout wrapper for all admin pages.

```typescript
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function Page() {
  return (
    <AdminLayout>
      {/* Your content here */}
    </AdminLayout>
  )
}
```

**Features**:
- Responsive sidebar
- Mobile-optimized header
- Dark mode support
- Smooth animations

#### AdminHeader
Navigation header with user menu.

```typescript
import { AdminHeader } from '@/components/admin/AdminHeader'

<AdminHeader 
  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
  sidebarCollapsed={sidebarCollapsed}
/>
```

**Includes**:
- Theme toggle
- User avatar
- Notifications (desktop)
- User menu dropdown
- Mobile hamburger

#### AdminSidebar
Navigation sidebar with menu items.

```typescript
import { AdminSidebar } from '@/components/admin/AdminSidebar'

<AdminSidebar 
  isOpen={sidebarOpen}
  isCollapsed={sidebarCollapsed}
  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
/>
```

**Features**:
- Collapsible menu
- Role-based filtering
- Active state highlighting
- Smooth animations

### UI Components (from shadcn/ui)

#### Button
```typescript
import { Button } from '@/components/ui/button'

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button disabled>Disabled</Button>
```

#### Card
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

#### Input
```typescript
import { Input } from '@/components/ui/input'

<Input 
  type="text"
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### Label
```typescript
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

#### Textarea
```typescript
import { Textarea } from '@/components/ui/textarea'

<Textarea
  placeholder="Enter message"
  rows={5}
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>
```

#### Switch
```typescript
import { Switch } from '@/components/ui/switch'

<Switch 
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

#### Tabs
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Badge
```typescript
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge className="bg-blue-500">Custom</Badge>
```

#### Avatar
```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

<Avatar>
  <AvatarImage src="https://..." alt="Name" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

#### Dropdown Menu
```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Label</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## 📐 Responsive Patterns

### Mobile-First Grid

```typescript
// 1 column on mobile, 2 on tablet, 4 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  {/* Cards */}
</div>
```

### Responsive Padding

```typescript
// Responsive padding
<div className="p-4 md:p-6 lg:p-8">Content</div>

// Responsive horizontal padding
<div className="px-4 md:px-6 lg:px-8">Content</div>

// Using utility
<div className="p-responsive">Content</div>
```

### Responsive Typography

```typescript
// Text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
<p className="text-sm md:text-base lg:text-lg">Paragraph</p>

// Font weights
<span className="font-normal md:font-semibold">Text</span>
```

### Responsive Flex Layout

```typescript
// Stack on mobile, flex on desktop
<div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>
```

## 🎨 Theme Styling

### Dark Mode

```typescript
// Text colors
<div className="text-gray-900 dark:text-white">Dark mode aware text</div>

// Background colors
<div className="bg-white dark:bg-gray-900">Dark mode aware bg</div>

// Border colors
<div className="border border-gray-200 dark:border-gray-700">Dark mode border</div>

// Hover states
<button className="hover:bg-gray-100 dark:hover:bg-gray-800">Hover</button>
```

### Glassmorphism

```typescript
<div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20">
  Glassmorphic card
</div>
```

### Gradients

```typescript
// Gradient background
<div className="bg-gradient-to-br from-blue-500 to-indigo-600">
  Gradient
</div>

// Gradient text
<h1 className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

## 🎬 Animations

### Framer Motion

```typescript
import { motion } from 'framer-motion'

// Fade in animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Slide in from left
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.4 }}
>
  Content
</motion.div>

// Hover effect
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Interactive element
</motion.div>
```

### CSS Animations

```typescript
// Using tailwind animations
<div className="animate-pulse">Pulsing element</div>
<div className="animate-spin">Loading spinner</div>
<div className="animate-slide-in">Custom animation</div>
```

## 🎯 Common Patterns

### Form with Validation

```typescript
const [formData, setFormData] = useState({
  email: '',
  password: ''
})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    // Submit logic
    toast.success('Success!')
  } catch (error) {
    toast.error('Error!')
  }
}

return (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
    </div>
    <Button type="submit">Submit</Button>
  </form>
)
```

### Modal/Dialog

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const [open, setOpen] = useState(false)

return (
  <>
    <Button onClick={() => setOpen(true)}>Open</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  </>
)
```

### Data Table

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Header 1</TableHead>
      <TableHead>Header 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.col1}</TableCell>
        <TableCell>{row.col2}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## 🎨 Color Utilities

### Tailwind Color Classes

```typescript
// Primary colors
<div className="bg-blue-50 dark:bg-blue-950">Very light</div>
<div className="bg-blue-500">Primary</div>
<div className="bg-blue-900 dark:bg-blue-100">Dark</div>

// Status colors
<div className="text-green-600">Success</div>
<div className="text-red-600">Error</div>
<div className="text-yellow-600">Warning</div>
<div className="text-blue-600">Info</div>
```

## 📱 Mobile Considerations

### Touch-Friendly Spacing

```typescript
// Minimum 44px touch target
<button className="p-3 md:p-2">Click me</button>
```

### Readable Typography

```typescript
// Larger text on mobile
<p className="text-sm md:text-base">Text</p>
```

### Swipe-Friendly Layout

```typescript
// Easy swiping on mobile
<div className="flex overflow-x-auto space-x-4">
  {items.map(item => (
    <div key={item.id} className="flex-shrink-0 w-64">
      {item.name}
    </div>
  ))}
</div>
```

## 🚀 Performance Tips

1. **Lazy Load Images**
```typescript
<img loading="lazy" src="..." alt="..." />
```

2. **Code Splitting**
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

3. **Memoization**
```typescript
const MemoComponent = memo(({ prop }) => <div>{prop}</div>)
```

4. **Avoid Inline Functions**
```typescript
// ❌ Bad
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Good
const handleButtonClick = useCallback(() => handleClick(id), [id])
<button onClick={handleButtonClick}>Click</button>
```

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)

## 🎓 Example: Complete Page

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function PageContent() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ name: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      // API call here
      toast.success('Success!')
    } catch (error) {
      toast.error('Error!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto"
    >
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Page Title
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Description
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle>Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  )
}
```

---

**Last Updated**: June 2024
**Version**: 2.5.0
