# gzv Backend - Complete Setup and Deployment Guide

This guide covers the setup, configuration, and deployment of the gzv backend system.

## Overview

The gzv backend is a Next.js application that serves as the API for the gzv.one frontend. It provides endpoints for:
- User management and authentication
- Articles/Blog content
- Courses and learning management
- Projects management
- Finance and transactions
- Media and file management

## Prerequisites

- Node.js 18+ or 20+
- pnpm package manager
- Supabase account (for PostgreSQL database)
- Cloudinary account (optional, for media storage)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd gzv-project
pnpm install
```

### 2. Configure Environment Variables

Copy the example env file and update with your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# CORS - Add your frontend domain
ALLOWED_ORIGINS=https://gzv.one,https://www.gzv.one

# Optional: Cloudinary for media
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Session
SESSION_SECRET=change-this-to-random-string
```

### 3. Setup Database Schema

Execute the SQL files in order to create database tables:

```bash
# Using Supabase SQL Editor or psql:
# 1. Connect to your Supabase database
# 2. Copy and execute each SQL file from the sql/ directory in order:

1. sql/01-users.sql
2. sql/02-articles.sql
3. sql/03-courses.sql
4. sql/04-projects.sql
5. sql/05-finance.sql
6. sql/06-media.sql
```

**Supabase SQL Editor Method:**
1. Go to Supabase Dashboard > SQL Editor
2. Create new query
3. Copy content from each SQL file
4. Execute

### 4. Create Admin User (if needed)

```sql
-- Execute in Supabase SQL Editor
INSERT INTO public.profiles (id, email, full_name, role, status)
VALUES (
  'admin-user-id',
  'admin@gzv.one',
  'Admin User',
  'admin',
  'active'
);
```

## Development

### Start Development Server

```bash
pnpm dev
```

The app will be available at:
- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api`

### Run Tests

```bash
pnpm test
```

### Linting

```bash
pnpm lint
```

## Project Structure

```
.
├── app/                      # Next.js app directory
│   ├── admin/               # Admin pages (UI)
│   ├── api/                 # API endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── articles/       # Articles API
│   │   ├── courses/        # Courses API
│   │   ├── projects/       # Projects API
│   │   ├── users/          # Users API
│   │   └── health/         # Health check
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── admin/             # Admin panel components
│   ├── auth/              # Auth components
│   └── ui/                # UI components
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── cors.ts           # CORS middleware
│   ├── api-auth.ts       # API authentication
│   └── ...
├── sql/                   # Database schemas
│   ├── 01-users.sql
│   ├── 02-articles.sql
│   ├── 03-courses.sql
│   ├── 04-projects.sql
│   ├── 05-finance.sql
│   ├── 06-media.sql
│   └── README.md
├── docs/                  # Documentation
│   ├── API.md
│   └── FRONTEND_INTEGRATION.md
├── public/               # Static assets
├── scripts/              # Build and setup scripts
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/refresh` - Refresh token

### Content Management
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `GET /api/articles/:id` - Get article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Learning Management
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course
- `POST /api/courses/:id/enroll` - Enroll in course

### Project Management
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project

### User Management
- `GET /api/users` - List users (admin only)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update profile

### Media Management
- `GET /api/media` - List media files
- `POST /api/media/upload` - Upload file
- `DELETE /api/media/:id` - Delete file

### Finance
- `GET /api/finance/transactions` - List transactions
- `GET /api/finance/reports` - Financial reports

### Health
- `GET /api/health` - API health status

See `docs/API.md` for complete API documentation.

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Configure environment variables in Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add all variables from `.env.example`
3. Redeploy

### Deploy to Other Platforms

#### Docker Deployment

```bash
# Build image
docker build -t gzv-backend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  gzv-backend
```

#### Traditional Server

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database schema executed
- [ ] CORS origins configured for production domains
- [ ] SSL/HTTPS enabled
- [ ] Database backups configured
- [ ] Logging and monitoring setup
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Admin user created
- [ ] API tested with frontend

## Monitoring and Maintenance

### Logs

```bash
# View logs in development
pnpm dev

# Production logs depend on hosting platform
# Vercel: Dashboard > Functions
# Docker: docker logs <container-id>
```

### Database Maintenance

```bash
# Backup database (Supabase handles this automatically)
# Manual backup via Supabase dashboard:
# 1. Project Settings > Database
# 2. Backups > Create backup
```

### Performance Monitoring

Monitor these metrics:
- API response times
- Database query performance
- Error rates
- User activity

## Troubleshooting

### Database Connection Issues

**Error**: `Failed to connect to database`

**Solution**:
1. Verify Supabase credentials in `.env.local`
2. Check database status in Supabase dashboard
3. Ensure IP whitelist includes your server

### CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check `ALLOWED_ORIGINS` in `.env.local`
2. Verify frontend domain is in the list
3. Clear browser cache and try again

### Authentication Issues

**Error**: `Unauthorized` or `Invalid token`

**Solution**:
1. Verify token is being sent in Authorization header
2. Check token hasn't expired
3. Clear localStorage and re-login

### API Not Responding

**Error**: `Cannot GET /api/...`

**Solution**:
1. Check API endpoint path spelling
2. Verify API is running: `curl http://localhost:3000/api/health`
3. Check server logs for errors

## Security

### Best Practices

1. **Never commit `.env.local`** - Use `.env.example` template
2. **Rotate secrets regularly**
3. **Use strong passwords** for admin accounts
4. **Enable 2FA** when available
5. **Keep dependencies updated**: `pnpm update`
6. **Monitor access logs** for suspicious activity
7. **Use HTTPS** in production
8. **Implement rate limiting** for API endpoints

### Security Headers

Headers are automatically set by Next.js. For additional security:
- Enable HSTS (HTTP Strict Transport Security)
- Set CSP (Content Security Policy)
- Configure CORS properly (already done)

## Frontend Integration

The frontend at `gzv.one` should:

1. Set `NEXT_PUBLIC_API_URL=https://api.gzv.one`
2. Use authentication endpoints to login
3. Include `Authorization: Bearer <token>` in API requests
4. Implement token refresh when expired

See `docs/FRONTEND_INTEGRATION.md` for detailed integration guide.

## Support and Contact

- **Issues**: Create GitHub issue
- **Documentation**: See `docs/` directory
- **API Docs**: See `docs/API.md`
- **Contact**: support@gzv.one

## License

Proprietary - All rights reserved

## Version History

- **1.0.0** (2024-12-21) - Initial release
  - User management
  - Articles/Blog system
  - Courses management
  - Projects management
  - Finance tracking
  - Media management
  - CORS configuration for external frontend
