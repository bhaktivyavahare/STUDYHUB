# StudyHub

**Learn. Share. Grow.**

StudyHub is a full-stack academic resource-sharing web application designed for college students, faculty members, and system administrators. It provides a structured platform for uploading, discovering, downloading, and engaging with academic study materials such as lecture notes, assignments, and presentations, organized by branch, semester, subject, and unit.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [User Roles and Permissions](#user-roles-and-permissions)
- [File Storage](#file-storage)
- [Security Design](#security-design)
- [Environment Variables](#environment-variables)
- [Frontend Pages](#frontend-pages)

---

## Project Overview

StudyHub addresses the common problem of fragmented academic resource sharing across college communities. Instead of resources being scattered across messaging apps and personal drives, StudyHub centralizes them in a searchable, filterable, and moderated repository.

Every uploaded file goes through a verification workflow before it becomes publicly accessible. Faculty and administrators review pending submissions and either approve or reject them with an optional reason. This ensures that only quality, relevant content reaches students.

The platform tracks resource engagement through download counts, view counts, star ratings (1 to 5), and a comment section, giving uploaders feedback on how useful their contributions are.

---

## Core Features

**Resource Management**

- Upload academic files (PDF, DOC, DOCX, PPT, PPTX) up to 50 MB per file
- Organize resources by branch, semester, subject, and unit
- Attach comma-separated tags to resources for improved discoverability
- Admin and faculty can approve or reject uploaded resources with a rejection reason
- Resource owners and administrators can delete resources
- Download count and view count are tracked automatically per resource

**Discovery and Search**

- Browse all approved resources with server-side pagination (default 12 per page)
- Full-text search across resource title and description
- Filter by branch, semester, subject, unit, and resource type
- Sort by newest, oldest, most downloaded, or most viewed

**Engagement**

- Star ratings from 1 to 5, one rating per user per resource, upsertable
- Comment section with public read access; authenticated users can post and delete their own comments
- Bookmark resources to a personal reading list
- View your own bookmarks, uploads, and statistics from your dashboard

**User Accounts**

- Register with name, email, password, role, branch, and semester
- Stateless JWT-based authentication with Bearer token authorization
- Profile editing for name, bio, branch, and semester
- Role-based dashboards for students, faculty, and administrators

**Administration**

- Admin panel to view all users and pending resources
- Pending resource queue accessible to both admins and faculty
- Verify (approve or reject) any pending resource

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI component library |
| Vite | 5.2.11 | Build tool and dev server |
| React Router DOM | 6.23.1 | Client-side routing |
| Axios | 1.7.2 | HTTP client with request and response interceptors |
| Custom CSS | - | Design system, layout, and component styles |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | LTS | JavaScript runtime |
| Express.js | 4.19.2 | HTTP server and routing framework |
| mysql2 | 3.9.7 | MySQL client with promise-based connection pool |
| pg | 8.23.0 | PostgreSQL client for Supabase hosted database |
| jsonwebtoken | 9.0.2 | JWT generation and verification |
| bcryptjs | 2.4.3 | Password hashing with salt rounds |
| multer | 2.2.0 | Multipart form data parsing using memory storage |
| cloudinary | latest | Cloud storage for uploaded academic files |
| helmet | 7.1.0 | HTTP security headers |
| cors | 2.8.5 | Cross-origin resource sharing policy |
| dotenv | 16.4.5 | Environment variable loading |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL via Supabase | Primary relational database |
| MySQL 8.x compatible schema | Original schema definition using InnoDB and utf8mb4 |

---

## Project Structure

```
studyhub/
├── backend/
│   ├── src/
│   │   ├── app.js                    Express application setup
│   │   ├── server.js                 HTTP server entry point
│   │   ├── config/
│   │   │   └── db.js                 Database connection pool
│   │   ├── controllers/
│   │   │   ├── academicController.js   Branches, semesters, subjects, units
│   │   │   ├── authController.js       Register, login, get current user
│   │   │   ├── engagementController.js Comments and ratings
│   │   │   ├── healthController.js     Health check endpoint
│   │   │   ├── resourceController.js   Full resource CRUD, bookmarks, download
│   │   │   └── userController.js       Profile, uploads, stats, admin views
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       JWT verification
│   │   │   ├── errorHandler.js         Centralised error response
│   │   │   ├── roleMiddleware.js        Role-based access control
│   │   │   └── uploadMiddleware.js     Multer config and file type filtering
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── academicRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── engagementRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   ├── resourceRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   ├── authService.js          Password hash and JWT helpers
│   │   │   └── storageService.js       Cloudinary upload, signed URL, delete
│   │   ├── utils/
│   │   │   └── response.js             Standardised JSON response helpers
│   │   └── validators/
│   ├── uploads/                        Local fallback storage, development only
│   ├── .env                            Environment variables, not committed to git
│   ├── .env.example                    Environment variable reference template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     Root component with router configuration
│   │   ├── main.jsx                    React DOM render entry point
│   │   ├── index.css                   Global design system and CSS variables
│   │   ├── components/
│   │   │   ├── CommentSection.jsx      Per-resource comment thread UI
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx              Responsive navigation with auth state
│   │   │   ├── ProtectedRoute.jsx      Route guard by authentication and role
│   │   │   ├── ResourceCard.jsx        Grid card component for resource listings
│   │   │   └── StarRating.jsx          Interactive 1 to 5 star rating widget
│   │   ├── context/
│   │   │   └── AuthContext.jsx         Global authentication state provider
│   │   ├── hooks/
│   │   │   └── useAuth.js              Auth context consumer hook
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminPanel.jsx          User list and pending resources review
│   │   │   ├── ExploreResources.jsx    Search, filter, paginated resource grid
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── LandingPage.jsx         Public home page
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MyBookmarks.jsx
│   │   │   ├── MyProfile.jsx           Profile view and edit
│   │   │   ├── MyUploads.jsx           Personal upload history with status
│   │   │   ├── RegisterPage.jsx        Multi-field registration form
│   │   │   ├── ResourceDetails.jsx     Full resource view, ratings, comments
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── UploadResource.jsx      File upload form with academic hierarchy
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── api.js                  Axios instance with interceptors
│   │   │   ├── authService.js          Login and register API calls
│   │   │   ├── engagementService.js    Comments and ratings API calls
│   │   │   └── resourceService.js      Resource CRUD and download API calls
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql                      Core 12-table schema
│   ├── phase3_schema.sql               Comments and ratings tables
│   ├── seed.sql                        Base seed data
│   └── supabase_complete_seed.sql      Full seed data for Supabase deployment
└── docs/
    └── architecture.md                Architecture overview document
```

---

## Architecture

The application follows a three-tier architecture with a clear separation between the presentation layer, the business logic layer, and the data layer.

```
Browser (React 18 + Vite)
  |
  |  HTTP / HTTPS   JSON payloads, Bearer token in Authorization header
  |
Express.js Backend (Node.js)
  |
  |-- CORS + Helmet (security middleware)
  |-- JSON body parser
  |-- Route handlers
  |     |-- /api/auth           authRoutes
  |     |-- /api/resources      resourceRoutes
  |     |-- /api/academic       academicRoutes
  |     |-- /api/engagement     engagementRoutes
  |     |-- /api/users          userRoutes
  |     |-- /api/health         healthRoutes
  |
  |-- Middleware chain
  |     |-- authMiddleware       JWT verification
  |     |-- roleMiddleware       RBAC enforcement
  |     |-- uploadMiddleware     Multer, file type validation, 50 MB limit
  |     |-- errorHandler         Centralised error formatting
  |
  |-- Controllers (business logic layer)
  |
  |-- Services
  |     |-- authService          bcrypt hash and compare, JWT sign and verify
  |     |-- storageService       Cloudinary upload, sign, delete, local fallback
  |
PostgreSQL Database (Supabase hosted)
  |
  |-- Connection pool (pg / mysql2)
  |-- 14 relational tables
```

**Frontend data flow**

The AuthContext provider stores the authenticated user object and JWT token in React component state. The api.js Axios instance automatically attaches the Authorization Bearer token header to every outgoing request via a request interceptor. A response interceptor handles 401 errors by clearing authentication state and redirecting to the login page. ProtectedRoute components guard private pages by checking authentication state and verifying the required user role before rendering the page component.

---

## Database Schema

The database is composed of 14 tables across two schema migration files.

### Core Tables (schema.sql)

**roles**

Stores the three user role definitions used throughout the system.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| name | VARCHAR(50) | Unique. Values: STUDENT, FACULTY, ADMIN |
| description | VARCHAR(255) | Optional description text |
| created_at | TIMESTAMP | Set automatically on insert |

**branches**

Represents academic engineering or science departments such as Computer Science or Electronics.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| name | VARCHAR(100) | Unique branch name |
| code | VARCHAR(20) | Unique short code, for example CSE |
| created_at | TIMESTAMP | Set automatically on insert |

**semesters**

Each branch contains multiple semesters. A unique constraint prevents duplicate semester numbers within the same branch.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| branch_id | INT | Foreign key to branches |
| number | INT | Semester number, typically 1 through 8 |
| name | VARCHAR(50) | Display name |
| created_at | TIMESTAMP | Set automatically on insert |

**subjects**

Subjects belong to a semester. Each subject carries a unique course code.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| semester_id | INT | Foreign key to semesters |
| name | VARCHAR(150) | Subject display name |
| code | VARCHAR(30) | Unique subject code |
| created_at | TIMESTAMP | Set automatically on insert |

**units**

Sub-divisions within a subject. A unique constraint prevents duplicate unit numbers within the same subject.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| subject_id | INT | Foreign key to subjects |
| number | INT | Unit number |
| name | VARCHAR(150) | Unit title |
| created_at | TIMESTAMP | Set automatically on insert |

**users**

Stores all user accounts. Passwords are stored as bcrypt hashes and never in plain text.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| name | VARCHAR(100) | Display name |
| email | VARCHAR(150) | Unique, indexed |
| password_hash | VARCHAR(255) | bcrypt hash of the password |
| role_id | INT | Foreign key to roles, indexed |
| branch_id | INT | Nullable foreign key to branches |
| semester_id | INT | Nullable foreign key to semesters |
| profile_image | VARCHAR(255) | Optional image URL |
| bio | TEXT | Optional profile biography |
| created_at | TIMESTAMP | Set automatically on insert |
| updated_at | TIMESTAMP | Updated automatically on row change |

**resource_types**

Categorical labels applied to resources. Examples include Notes, Assignment, Question Paper, and Lab Manual.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| name | VARCHAR(100) | Unique type name |
| created_at | TIMESTAMP | Set automatically on insert |

**resources**

The central table of the application. Stores all metadata for every uploaded academic file.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| title | VARCHAR(255) | Resource title |
| description | TEXT | Optional description |
| subject_id | INT | Foreign key to subjects |
| unit_id | INT | Nullable foreign key to units |
| resource_type_id | INT | Foreign key to resource_types |
| uploaded_by | INT | Foreign key to users |
| file_path | VARCHAR(255) | Cloudinary public_id or local relative path |
| file_name | VARCHAR(255) | Original filename from the uploader |
| file_type | VARCHAR(100) | MIME type string |
| file_size | BIGINT | File size in bytes |
| verification_status | ENUM | PENDING, APPROVED, or REJECTED |
| rejection_reason | TEXT | Nullable, populated when rejected |
| download_count | INT | Incremented on each download event |
| view_count | INT | Incremented on each detail page view |
| created_at | TIMESTAMP | Set automatically on insert |
| updated_at | TIMESTAMP | Updated automatically on row change |

**tags**

A global pool of reusable tag strings.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| name | VARCHAR(50) | Unique tag name |
| created_at | TIMESTAMP | Set automatically on insert |

**resource_tags**

Many-to-many join table linking resources to tags.

| Column | Type | Notes |
|---|---|---|
| resource_id | INT | Foreign key to resources, part of composite PK |
| tag_id | INT | Foreign key to tags, part of composite PK |
| created_at | TIMESTAMP | Set automatically on insert |

**bookmarks**

Allows a user to save resources to a personal reading list. A composite primary key prevents duplicate entries.

| Column | Type | Notes |
|---|---|---|
| user_id | INT | Foreign key to users, part of composite PK |
| resource_id | INT | Foreign key to resources, part of composite PK |
| created_at | TIMESTAMP | Set automatically on insert |

**downloads**

Audit log of all download events. The user_id is nullable to support future anonymous download tracking.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| resource_id | INT | Foreign key to resources (CASCADE delete) |
| user_id | INT | Nullable foreign key to users |
| created_at | TIMESTAMP | Set automatically on insert |

### Engagement Tables (phase3_schema.sql)

**comments**

Per-resource discussion threads. Indexed on resource_id for fast retrieval by resource.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| resource_id | INT | Foreign key to resources (CASCADE delete) |
| user_id | INT | Foreign key to users (CASCADE delete) |
| content | TEXT | Comment body |
| created_at | TIMESTAMP | Set automatically on insert |
| updated_at | TIMESTAMP | Updated automatically on row change |

**ratings**

One rating per user per resource, enforced by a unique constraint. The rating value must be between 1 and 5 inclusive.

| Column | Type | Notes |
|---|---|---|
| id | INT | Primary key, auto-increment |
| resource_id | INT | Foreign key to resources (CASCADE delete) |
| user_id | INT | Foreign key to users (CASCADE delete) |
| rating | TINYINT | Integer from 1 to 5, enforced by CHECK constraint |
| created_at | TIMESTAMP | Set automatically on insert |
| updated_at | TIMESTAMP | Updated automatically on row change |

---

## API Reference

All endpoints are prefixed with `/api`. Request bodies must be JSON unless the endpoint accepts `multipart/form-data` for file uploads. Successful responses follow the shape `{ success: true, message: "...", data: { ... } }`. Error responses follow `{ success: false, message: "..." }`.

Authentication is performed by passing the JWT in the `Authorization: Bearer <token>` request header.

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/health | None | Returns server status and uptime |

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | None | Create a new user account |
| POST | /api/auth/login | None | Authenticate and receive a signed JWT |
| GET | /api/auth/me | Required | Return the current authenticated user object |

**POST /api/auth/register**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "STUDENT | FACULTY | ADMIN",
  "branch_id": "number (optional)",
  "semester_id": "number (optional)"
}
```

**POST /api/auth/login**

```json
{
  "email": "string",
  "password": "string"
}
```

### Academic Hierarchy

All academic endpoints are public and require no authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/academic/branches | List all branches |
| GET | /api/academic/semesters/:branchId | List semesters for a given branch |
| GET | /api/academic/subjects/:semesterId | List subjects for a given semester |
| GET | /api/academic/units/:subjectId | List units for a given subject |
| GET | /api/academic/resource-types | List all resource type labels |

### Resources

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/resources | None | List approved resources with filters and pagination |
| GET | /api/resources/:id | None | Get a single resource by ID, increments view count |
| POST | /api/resources/upload | Required | Upload a new resource file |
| GET | /api/resources/:id/download | Required | Download resource via signed CDN redirect |
| DELETE | /api/resources/:id | Required | Delete a resource and its stored file |
| PUT | /api/resources/:id/verify | ADMIN or FACULTY | Approve or reject a pending resource |
| POST | /api/resources/:id/bookmark | Required | Bookmark a resource |
| DELETE | /api/resources/:id/bookmark | Required | Remove a bookmark |
| GET | /api/resources/me/bookmarks | Required | List the current user's bookmarks |

**GET /api/resources query parameters**

| Parameter | Type | Description |
|---|---|---|
| q | string | Search title and description |
| branch_id | number | Filter by branch |
| semester_id | number | Filter by semester |
| subject_id | number | Filter by subject |
| unit_id | number | Filter by unit |
| resource_type_id | number | Filter by resource type |
| sort | string | newest (default), oldest, downloads, views |
| page | number | Page number, default 1 |
| limit | number | Results per page, default 12 |
| status | string | PENDING, APPROVED, REJECTED. Available to ADMIN and FACULTY only |

**POST /api/resources/upload fields (multipart/form-data)**

| Field | Type | Required | Description |
|---|---|---|---|
| file | File | Yes | PDF, DOC, DOCX, PPT, or PPTX, maximum 50 MB |
| title | string | Yes | Resource title |
| subject_id | number | Yes | Subject this resource belongs to |
| resource_type_id | number | Yes | Resource type label ID |
| description | string | No | Optional description |
| unit_id | number | No | Optional unit within the subject |
| tags | string | No | Comma-separated tag names |

**PUT /api/resources/:id/verify**

```json
{
  "status": "APPROVED | REJECTED",
  "rejection_reason": "string (required when status is REJECTED)"
}
```

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/users/me | Required | Get the current user's full profile |
| PUT | /api/users/me | Required | Update name, bio, branch_id, or semester_id |
| GET | /api/users/me/uploads | Required | List resources uploaded by the current user |
| GET | /api/users/me/stats | Required | Dashboard statistics including total uploads, downloads, views |
| GET | /api/users/admin/pending-resources | ADMIN or FACULTY | List all resources with PENDING status |
| GET | /api/users/admin/users | ADMIN | List all registered users |

### Engagement

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/engagement/resources/:resourceId/comments | None | Get all comments for a resource |
| POST | /api/engagement/resources/:resourceId/comments | Required | Post a new comment |
| DELETE | /api/engagement/comments/:id | Required | Delete the current user's comment |
| POST | /api/engagement/resources/:resourceId/rate | Required | Submit or update a star rating |
| GET | /api/engagement/resources/:resourceId/my-rating | Required | Get the current user's rating for a resource |

**POST /api/engagement/resources/:resourceId/rate**

```json
{
  "rating": 4
}
```

The value must be an integer between 1 and 5. If the user has already rated the resource, the existing rating record is updated.

---

## User Roles and Permissions

Three roles are supported. Role assignments are stored in the database, embedded in the JWT, and enforced server-side by the roleMiddleware layer on every protected request.

| Action | STUDENT | FACULTY | ADMIN |
|---|---|---|---|
| Browse approved resources | Yes | Yes | Yes |
| Download approved resources | Yes | Yes | Yes |
| Rate and comment on resources | Yes | Yes | Yes |
| Bookmark resources | Yes | Yes | Yes |
| Upload resources | Yes | Yes | Yes |
| Delete own resources | Yes | Yes | Yes |
| Delete any resource | No | No | Yes |
| View pending resources queue | No | Yes | Yes |
| Approve or reject resources | No | Yes | Yes |
| View all registered users | No | No | Yes |

Resources uploaded by any role start with a verification_status of PENDING. They are only visible to the general public after being set to APPROVED by a faculty member or administrator. The original uploader can view their own pending resources at any time through the My Uploads page.

---

## File Storage

Uploaded files are stored in Cloudinary using a structured public_id hierarchy that mirrors the academic organization of the application.

```
studyhub-resources/
  subjects/
    <subject_id>/
      units/
        <unit_id>/
          <unix-timestamp>-<sanitised-filename>.<ext>
```

The file_path column in the resources table stores the Cloudinary public_id. This value is never returned in public-facing API responses. File content is not proxied through the Express server. Instead, the download endpoint calls the Cloudinary SDK to generate a short-lived signed URL valid for one hour, then responds with an HTTP 302 redirect. The browser downloads the file directly from Cloudinary's CDN.

Multer is configured to use memory storage so the uploaded buffer is never written to the server's disk before being streamed to Cloudinary. This design is compatible with stateless serverless and PaaS deployments.

**Accepted file types**

| Format | MIME Type |
|---|---|
| PDF | application/pdf |
| Word Document .doc | application/msword |
| Word Document .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| PowerPoint .ppt | application/vnd.ms-powerpoint |
| PowerPoint .pptx | application/vnd.openxmlformats-officedocument.presentationml.presentation |

Maximum file size: 50 MB per upload.

**Local fallback**

When the three CLOUDINARY_* environment variables are absent, uploads fall back to the local backend/uploads/ directory. This mode is intended exclusively for local development and is not suitable for shared or production environments.

---

## Security Design

**Password hashing**

User passwords are processed through bcryptjs with a configurable number of salt rounds before storage. Plain-text passwords are never persisted, returned in responses, or written to server logs.

**JWT authentication**

After successful login, the server produces a signed JWT containing the user ID, email, and role name. The token is stateless and does not require server-side session storage. For production use, it is recommended to configure a token expiry using the expiresIn option in jwt.sign.

**Role-Based Access Control**

The roleMiddleware function reads the role_name claim from the decoded JWT and compares it against the list of roles permitted for the route. If the role does not match, the request is rejected with a 403 response before the controller function is invoked.

**Input validation**

Request bodies pass through validators before reaching controller logic. The upload middleware independently validates both the file extension and the MIME type to prevent extension spoofing where an attacker renames a disallowed file with an allowed extension.

**HTTP security headers**

The helmet middleware applies a standard set of HTTP security headers to every response, including Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and others.

**CORS policy**

CORS is configured with an explicit allowlist. The permitted origin is read from the FRONTEND_URL environment variable. In development, http://localhost:5173 is automatically permitted. All authentication uses the Authorization header; cookies are not used.

**Storage path confidentiality**

Raw Cloudinary public_id values stored in file_path are never included in public API responses. The getResourceById controller explicitly removes file_path from the response before sending. Downloads are always routed through a server-generated signed URL so storage paths remain opaque to clients.

---

## Environment Variables

### Backend (backend/.env)

| Variable | Required | Description |
|---|---|---|
| PORT | No | HTTP server port. Default: 5000 |
| DB_URL | Yes | PostgreSQL connection string for Supabase or a self-hosted instance |
| JWT_SECRET | Yes | Secret key for signing and verifying JWTs. Minimum 32 random characters recommended |
| CLOUDINARY_CLOUD_NAME | Yes in production | Cloudinary account cloud name from the dashboard |
| CLOUDINARY_API_KEY | Yes in production | Cloudinary API key from the dashboard |
| CLOUDINARY_API_SECRET | Yes in production | Cloudinary API secret. Must never be exposed to the client or committed to version control |
| CLOUDINARY_FOLDER | No | Root folder in the Cloudinary media library. Default: studyhub-resources |
| FRONTEND_URL | No | Allowed CORS origin. Default: http://localhost:5173 |

### Frontend (frontend/.env)

| Variable | Required | Description |
|---|---|---|
| VITE_API_BASE_URL | No | Backend base URL used by the Axios instance. Default: http://localhost:5000 |

---

## Frontend Pages

| Page | Route | Access Level | Description |
|---|---|---|---|
| Landing Page | / | Public | Marketing home page with calls to action |
| Login | /login | Public | Email and password authentication form |
| Register | /register | Public | Registration form with role, branch, and semester selection |
| Explore Resources | /explore | Public | Searchable, filterable, paginated resource grid |
| Resource Details | /resources/:id | Public | Full resource information, star rating, and comment section |
| Upload Resource | /upload | Authenticated | Upload form with academic hierarchy selectors |
| Student Dashboard | /dashboard | STUDENT | Activity overview and quick navigation links |
| Faculty Dashboard | /dashboard | FACULTY | Pending review queue count and quick links |
| Admin Dashboard | /dashboard | ADMIN | Platform statistics and administrative quick links |
| Admin Panel | /admin | ADMIN | Full user list and pending resource approval table |
| My Profile | /profile | Authenticated | View and edit personal profile information |
| My Uploads | /my-uploads | Authenticated | Personal upload history with verification status badges |
| My Bookmarks | /bookmarks | Authenticated | Saved resource reading list |

Route access is enforced client-side by the ProtectedRoute component, which reads authentication state and role from AuthContext before rendering the page. Server-side enforcement via authMiddleware and roleMiddleware is always present as the authoritative security layer.
