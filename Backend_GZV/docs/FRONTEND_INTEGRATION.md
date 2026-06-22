# Frontend Integration Guide

This document explains how to integrate the frontend at `msc.edu.vn` with this backend API.

## Overview

The backend provides a REST API that the frontend can consume. The frontend and backend are separate applications that communicate via HTTP requests.

- **Frontend**: `https://msc.edu.vn` (frontend application)
- **Backend API**: `https://api.msc.edu.vn` (this project)

## Setup Steps

### 1. Configure Backend API URL

In your frontend `.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://api.msc.edu.vn
```

### 2. Implement Login

**Frontend Example (React/Next.js):**

```javascript
// pages/login.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      )

      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Store tokens
      localStorage.setItem('accessToken', data.data.session.access_token)
      localStorage.setItem('refreshToken', data.data.session.refresh_token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      router.push('/dashboard')
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  )
}
```

### 3. Create API Client

**Frontend Example (`lib/api-client.ts`):**

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken')
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API Error')
  }

  return data.data
}

// Specific endpoints
export const api = {
  articles: {
    list: () => apiCall('/api/articles'),
    get: (id: string) => apiCall(`/api/articles/${id}`),
    create: (data: any) => apiCall('/api/articles', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  },
  courses: {
    list: () => apiCall('/api/courses'),
    get: (id: string) => apiCall(`/api/courses/${id}`),
  },
  // ... more endpoints
}
```

### 4. Update CORS Configuration

The backend has CORS enabled for:
- `https://msc.edu.vn`
- `https://www.msc.edu.vn`
- `https://app.msc.edu.vn`

If using a different domain, update `ALLOWED_ORIGINS` in the backend `.env`:
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 5. Handle Authentication

When tokens expire, implement refresh token flow:

```typescript
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken')
  
  if (!refreshToken) {
    window.location.href = '/login'
    return
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    const data = await response.json()
    localStorage.setItem('accessToken', data.data.session.access_token)
    
    return data.data.session.access_token
  } catch (error) {
    localStorage.clear()
    window.location.href = '/login'
  }
}
```

### 6. Environment Setup

For development:

**Frontend `.env.local`:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Backend `.env`:**
```bash
ALLOWED_ORIGINS=http://localhost:3001
```

For production:

**Frontend `.env.production`:**
```bash
NEXT_PUBLIC_API_URL=https://api.msc.edu.vn
```

**Backend `.env`:**
```bash
ALLOWED_ORIGINS=https://msc.edu.vn,https://www.msc.edu.vn
```

## Database Schema

The backend uses Supabase PostgreSQL with the following tables:

- **Authentication**: `profiles`, `user_preferences`
- **Content**: `articles`, `article_comments`, `courses`, `course_lessons`
- **Projects**: `projects`, `project_tasks`, `project_milestones`
- **Finance**: `transactions`, `invoices`, `expenses`
- **Media**: `media_files`, `media_folders`

See `sql/` directory for complete schema definitions.

## API Structure

```
/api
  /auth
    /login          - POST (public)
    /verify         - GET (requires auth)
    /refresh        - POST (requires refresh token)
    /logout         - POST (requires auth)
  /articles         - GET, POST, PUT, DELETE
  /courses          - GET, POST, PUT, DELETE
  /projects         - GET, POST, PUT, DELETE
  /users            - GET, POST, PUT, DELETE (admin only)
  /media            - GET, POST, DELETE
  /finance          - GET (admin only)
  /health           - GET (public)
```

## Common Issues

### CORS Errors

If you get CORS errors:

1. **Check Origin**: Verify the frontend domain matches `ALLOWED_ORIGINS`
2. **Verify Method**: Ensure the request method is in allowed methods
3. **Headers**: Check that `Content-Type` and `Authorization` are in allowed headers
4. **Credentials**: If using cookies, set `credentials: 'include'` in fetch

### Authentication Issues

1. **Token Expired**: Implement automatic refresh token rotation
2. **Invalid Token**: Clear localStorage and redirect to login
3. **No Authorization Header**: Check that token is being sent correctly

### Database Connection Issues

1. **Check Supabase**: Verify database is running and credentials are correct
2. **Check Migrations**: Ensure SQL schema files have been executed
3. **Check Permissions**: Verify user has correct database permissions

## Testing

Test the API before integrating:

```bash
# Check health
curl https://api.msc.edu.vn/api/health

# Login
curl -X POST https://api.msc.edu.vn/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@test.com","password":"password"}'

# Verify token
curl https://api.msc.edu.vn/api/auth/verify \
  -H 'Authorization: Bearer <token>'
```

## Support

For integration help:
- API Documentation: See `docs/API.md`
- Database Schema: See `sql/README.md`
- Issues: Create an issue in the repository
- Contact: support@msc.edu.vn
