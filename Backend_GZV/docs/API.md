# MSC Backend API Documentation

This is the backend API documentation for the MSC project. The backend serves data to the frontend at `msc.edu.vn`.

## Base URL

```
https://api.msc.edu.vn
```

## Authentication

All API endpoints (except login and health check) require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## CORS Policy

The API accepts requests from:
- `https://msc.edu.vn`
- `https://www.msc.edu.vn`
- `https://app.msc.edu.vn`
- `http://localhost:3000` (development only)
- `http://localhost:3001` (development only)

## Response Format

All API responses follow a consistent JSON format:

### Success Response (2xx)
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication Endpoints

### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin|editor|user",
      "avatar": "https://..."
    },
    "session": {
      "access_token": "eyJhbGc...",
      "refresh_token": "eyJhbGc...",
      "expires_in": 3600,
      "expires_at": 1234567890
    }
  },
  "message": "Login successful"
}
```

### GET /api/auth/verify
Verify if the current authentication token is valid.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "admin"
    },
    "valid": true
  },
  "message": "Token is valid"
}
```

## Health Check

### GET /api/health
Check if the API is running.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-12-21T10:30:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## Database Endpoints

The following endpoints are available for data operations. All require authentication except `/api/health`.

### Articles
- `GET /api/articles` - List all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create new article (requires admin/editor)
- `PUT /api/articles/:id` - Update article (requires admin/editor)
- `DELETE /api/articles/:id` - Delete article (requires admin)

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course (requires admin/editor)
- `PUT /api/courses/:id` - Update course (requires admin/editor)
- `DELETE /api/courses/:id` - Delete course (requires admin)
- `POST /api/courses/:id/enroll` - Enroll in course

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (requires admin)
- `PUT /api/projects/:id` - Update project (requires admin)
- `DELETE /api/projects/:id` - Delete project (requires admin)

### Users
- `GET /api/users` - List all users (requires admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (requires admin)

### Media
- `GET /api/media` - List media files
- `POST /api/media/upload` - Upload media file
- `DELETE /api/media/:id` - Delete media file

### Finance
- `GET /api/finance/transactions` - List transactions (requires admin)
- `GET /api/finance/invoices` - List invoices (requires admin)
- `GET /api/finance/reports` - Get financial reports (requires admin)

## Query Parameters

Common query parameters for list endpoints:

```
?page=1                    # Page number (default: 1)
&limit=10                  # Items per page (default: 10, max: 100)
&search=keyword            # Search term
&sortBy=created_at         # Sort field
&sortOrder=asc             # Sort order: asc|desc
&status=published          # Filter by status
&category=tutorial         # Filter by category
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks required role/permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_JSON` | 400 | Invalid JSON in request body |
| `MISSING_FIELDS` | 400 | Required fields missing |
| `VALIDATION_ERROR` | 422 | Data validation failed |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user
- **Header**: `X-RateLimit-Remaining`

## Examples

### Login and Make Authenticated Request

```javascript
// 1. Login
const loginRes = await fetch('https://api.msc.edu.vn/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})

const loginData = await loginRes.json()
const accessToken = loginData.data.session.access_token

// 2. Make authenticated request
const articlesRes = await fetch('https://api.msc.edu.vn/api/articles', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})

const articles = await articlesRes.json()
```

### Using cURL

```bash
# Login
curl -X POST https://api.msc.edu.vn/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Verify token
curl -X GET https://api.msc.edu.vn/api/auth/verify \
  -H 'Authorization: Bearer <access_token>'

# Get articles
curl -X GET 'https://api.msc.edu.vn/api/articles?page=1&limit=10' \
  -H 'Authorization: Bearer <access_token>'
```

## Development

For local development, the API runs on `http://localhost:3000` and allows requests from `http://localhost:3000` and `http://localhost:3001`.

### Environment Variables

See `.env.example` for all available configuration options.

## Support

For API issues or questions, please contact: support@msc.edu.vn
