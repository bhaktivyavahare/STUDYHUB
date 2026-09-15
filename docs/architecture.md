# StudyHub - Architecture Documentation

## Overview
StudyHub ("Learn. Share. Grow.") is a full-stack academic resource-sharing web application built for college students, faculty members, and system administrators.

## Tech Stack
- **Frontend**: React 18, Vite, React Router v6, Axios, Custom CSS Design System
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.x with `mysql2/promise` connection pool
- **Authentication**: Stateless JWT (JSON Web Token), `bcryptjs` password hashing

## Architectural Layers

```
Frontend (React 18 + Vite)
   │
   ├─► Context (AuthContext & useAuth)
   ├─► Layouts & Pages (Landing, Login, Register, Dashboards)
   └─► Services (Axios HTTP Client with Interceptors)
        │
        ▼ REST APIs (JSON Payloads / Bearer Authorization Header)
Backend (Express.js)
   │
   ├─► App Setup (Cors, Helmet, JSON Parser, Central Error Middleware)
   ├─► Routes (/api/health, /api/auth, /api/academic)
   ├─► Middlewares (authMiddleware, roleMiddleware, errorHandler)
   ├─► Controllers & Validators (authController, authValidator, healthController)
   └─► Models & Services (userModel, roleModel, academicModel, authService)
        │
        ▼ mysql2/promise Connection Pool
Database (MySQL - studyhub)
   │
   ├─► roles (STUDENT, FACULTY, ADMIN)
   ├─► branches & semesters & subjects
   └─► users (FK to roles, branches, semesters; UNIQUE email, hashed passwords)
```

## Security Design
- **Password Security**: Passwords are salted and hashed using `bcryptjs` before DB storage. Plain text passwords are never stored or logged.
- **JWT Authentication**: Authenticated routes issue a signed JWT containing user ID, email, and role name.
- **Role-Based Access Control (RBAC)**: Backend endpoints strictly enforce user role authorizations (`STUDENT`, `FACULTY`, `ADMIN`).
- **Input Validation**: Request bodies undergo schema validation before reaching database controllers.
- **Security Headers & CORS**: `helmet` is enabled on the Express server to add HTTP defense headers, alongside configurable CORS policies.
