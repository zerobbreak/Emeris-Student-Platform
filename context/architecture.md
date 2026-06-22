# HIVE Showcase Platform
## System Architecture Document

**Version**: 1.0  
**Last Updated**: June 2026  
**Platform**: Neon + Next.js + ShadCN + TanStack Query + Drizzle

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Technology Stack Architecture](#technology-stack-architecture)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Application Layer Architecture](#application-layer-architecture)
6. [Database Architecture](#database-architecture)
7. [API Architecture](#api-architecture)
8. [Frontend Architecture](#frontend-architecture)
9. [Security Architecture](#security-architecture)
10. [Deployment Architecture](#deployment-architecture)
11. [Scalability & Performance](#scalability--performance)
12. [Integration Points](#integration-points)
13. [Error Handling & Observability](#error-handling--observability)

---

## Architecture Overview

### High-Level Architecture Pattern

The HIVE Showcase Platform follows a **modern full-stack, client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                   │
│          React Components + ShadCN + TanStack Query          │
├─────────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                          │
│                   (Next.js App Router)                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Server Components    │    Client Components             │ │
│  │  (SSR)                │    (Interactive)                 │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   API LAYER                                  │
│  (Next.js Route Handlers - RESTful Endpoints)                │
├─────────────────────────────────────────────────────────────┤
│                 BUSINESS LOGIC LAYER                         │
│  (Services, Queries, Authentication, AI Integration)         │
├─────────────────────────────────────────────────────────────┤
│              DATA ACCESS LAYER (Drizzle ORM)                 │
│  (Type-Safe Database Queries, Relations, Validations)        │
├─────────────────────────────────────────────────────────────┤
│            DATABASE & EXTERNAL SERVICES                      │
│  ┌──────────────────┬──────────────┬──────────────────────┐  │
│  │  Neon           │  File Storage │  OpenAI API          │  │
│  │  (PostgreSQL)   │  (Blob)       │  (AI Analysis)       │  │
│  └──────────────────┴──────────────┴──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Core Architectural Principles

1. **Separation of Concerns**
   - Clear boundaries between presentation, business logic, and data layers
   - Each layer has specific responsibilities

2. **Type Safety**
   - TypeScript throughout
   - Drizzle relations enforce database constraints
   - API response types mirror database models

3. **Scalability**
   - Stateless API design for horizontal scaling
   - Database connection pooling (Neon)
   - Client-side caching (TanStack Query)

4. **Security First**
   - Authentication at middleware level
   - Authorization checks in API routes
   - Encrypted data in transit (TLS) and at rest

5. **Performance Optimization**
   - Server-side rendering for SEO and initial load
   - Client-side rendering for interactivity
   - Efficient data fetching with caching strategy
   - Database query optimization with indexes

---

## System Architecture Diagram

### Component Interaction Map

```
┌──────────────────────────────────────────────────────────────┐
│                    BROWSER / CLIENT                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React Components Layer                                 │ │
│  │  (UI Components built with ShadCN)                      │ │
│  │                                                         │ │
│  │  - ProfileCard, ProjectGallery, LeaderboardWidget     │ │
│  │  - Forms, Modals, Dialogs, Lists                      │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  TanStack Query (Data State Management)                 │ │
│  │                                                         │ │
│  │  - Cache Management                                    │ │
│  │  - Query/Mutation Execution                            │ │
│  │  - Background Refetching                               │ │
│  │  - Optimistic Updates                                  │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Custom React Hooks                                    │ │
│  │                                                         │ │
│  │  - useStudentProfile()                                │ │
│  │  - useHiveProjects()                                  │ │
│  │  - useLeaderboard()                                   │ │
│  │  - useSkillAnalysis()                                 │ │
│  │  - useCreateProject()                                 │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│                       │ HTTP Requests (JSON)                  │
│                       ▼                                       │
└──────────────────────────────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌──────────────────────────────────────────────────────────────┐
│                   SERVER / BACKEND                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Next.js App Router                                    │ │
│  │                                                         │ │
│  │  - /app/page.tsx (Homepage)                           │ │
│  │  - /app/(dashboard)/* (Protected routes)              │ │
│  │  - /app/admin/* (Admin routes)                        │ │
│  │  - /app/api/v1/* (API routes)                         │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Middleware Layer                                      │ │
│  │                                                         │ │
│  │  - Authentication (JWT verification)                  │ │
│  │  - Authorization (Role-based access control)          │ │
│  │  - Rate Limiting                                      │ │
│  │  - Request Logging                                    │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  API Route Handlers (/api/v1/*)                        │ │
│  │                                                         │ │
│  │  GET    /profiles/{id}                                 │ │
│  │  PUT    /profiles/{id}                                 │ │
│  │  POST   /projects                                      │ │
│  │  GET    /hive-projects                                 │ │
│  │  GET    /skills                                        │ │
│  │  POST   /endorsements                                  │ │
│  │  GET    /leaderboards/{type}                           │ │
│  │  POST   /opportunities/{id}/apply                      │ │
│  │  GET    /skill-analysis/{id}                           │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Business Logic Layer / Services                       │ │
│  │                                                         │ │
│  │  - UserService                                        │ │
│  │  - ProjectService                                     │ │
│  │  - SkillService                                       │ │
│  │  - GamificationService                                │ │
│  │  - AIAnalysisService                                  │ │
│  │  - AuthService                                        │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  Database Query Layer (Drizzle ORM)                    │ │
│  │                                                         │ │
│  │  - lib/db/schema.ts (Type-safe models)                │ │
│  │  - lib/queries/*.ts (Query functions)                 │ │
│  │  - Relation loading (with clause)                     │ │
│  │  - Transaction support                                │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  External Services Integration                         │ │
│  │                                                         │ │
│  │  - OpenAI API (Skill Analysis)                         │ │
│  │  - Auth0 / JWT (Authentication)                        │ │
│  │  - SendGrid / Email Service (Notifications)            │ │
│  │  - Analytics (Usage Tracking)                          │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                       │
│                       ▼                                       │
└──────────────────────────────────────────────────────────────┘
                        │
                        │ SQL Queries
                        │
┌──────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Neon (PostgreSQL Database)                          │   │
│  │                                                      │   │
│  │  - users table                                      │   │
│  │  - projects, hiveProjects                           │   │
│  │  - skills, userSkills, endorsements                 │   │
│  │  - achievements, userAchievements, badges           │   │
│  │  - opportunities, userApplications                  │   │
│  │  - pointsTransactions, skillAnalysis                │   │
│  │                                                      │   │
│  │  Connection Pool (max 10-20 concurrent)             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Azure Blob Storage (File Storage)                   │   │
│  │                                                      │   │
│  │  - Profile images                                  │   │
│  │  - Project screenshots                             │   │
│  │  - Project demo videos                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Architecture

### Layer-by-Layer Breakdown

```
FRONTEND LAYER
├── Runtime: Browser (Chrome, Edge, Safari, Firefox)
├── Framework: React 18+ (with TypeScript)
├── UI Components: ShadCN UI (shadcn/ui)
│   ├── Built on: Radix UI (unstyled components)
│   ├── Styled with: Tailwind CSS
│   └── Icons: Lucide React
├── State Management: TanStack Query v5
│   ├── Query Caching
│   ├── Mutation Management
│   ├── Background Sync
│   └── Optimistic Updates
├── Styling: Tailwind CSS
├── Form Handling: React Hook Form + Zod validation
└── Utilities: Lodash, date-fns

APPLICATION LAYER
├── Framework: Next.js 14+ (App Router)
├── Language: TypeScript
├── Server Components: For SEO & initial rendering
├── Client Components: For interactivity
├── Middleware: Authentication, CORS, rate limiting
└── Environment: Node.js 18+

API & BUSINESS LOGIC LAYER
├── Framework: Next.js Route Handlers (REST API)
├── Request/Response: JSON format
├── Validation: Zod schemas
├── Authentication: JWT tokens
├── Authorization: Role-based access control (RBAC)
├── Logging: Winston / Pino
├── Error Handling: Custom error classes
└── External APIs: OpenAI API, SendGrid, etc.

DATA ACCESS LAYER
├── ORM: Drizzle ORM v0.28+
├── Database Driver: postgres (node-postgres)
├── Query Builder: Type-safe SQL queries
├── Migrations: Drizzle Kit
├── Connection Pooling: Built into Neon
└── Validation: Schema-level constraints

DATABASE LAYER
├── Database: Neon (Serverless PostgreSQL)
├── Version: PostgreSQL 14+
├── Connection: Pooled (max 10-20 concurrent)
├── Backup: Automatic daily backups
├── Replication: Built-in HA with standby
└── Regions: Region selection at setup

STORAGE LAYER
├── Profile Images: Azure Blob Storage
├── Project Assets: Azure Blob Storage
├── CDN: Azure CDN for cached assets
└── Backup: Geo-redundant storage (GRS)

AI/ML LAYER
├── Provider: OpenAI API
├── Model: GPT-4 Turbo
├── Use Cases:
│   ├── Skill Gap Analysis
│   ├── Career Pathway Recommendations
│   └── Content Moderation (future)
├── Caching: 7-day cache on analysis results
└── Rate Limiting: API quota management

DEPLOYMENT & INFRASTRUCTURE
├── Hosting: Vercel (Next.js optimized)
├── Edge Computing: Vercel Edge Functions
├── CI/CD: GitHub Actions
├── Version Control: GitHub
├── Monitoring: Vercel Analytics + Datadog
└── Domain: Custom domain with SSL/TLS
```

---

## Data Flow Architecture

### User Action to Database Update Flow

```
USER INITIATES ACTION
        ↓
┌─────────────────────────────────────────────────┐
│ Component Event Handler                         │
│ (onClick, onSubmit, onChange)                   │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ TanStack Query Mutation Hook                    │
│ (useMutation or useInfiniteQuery)               │
│                                                 │
│ - Pre-mutation: Optimistic update              │
│ - Cache invalidation prep                      │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ HTTP Request (Fetch API)                        │
│ - Method: POST/PUT/DELETE                      │
│ - Headers: Authorization (JWT), Content-Type   │
│ - Body: JSON payload                           │
└─────────────────┬───────────────────────────────┘
                  ↓
        ╔═════════════════════════════╗
        ║   NETWORK (HTTPS/TLS 1.3)  ║
        ╚═════════════════════════════╝
                  ↓
┌─────────────────────────────────────────────────┐
│ Next.js Middleware                              │
│ - Request validation                           │
│ - Authentication check                         │
│ - Rate limit check                             │
└─────────────────┬───────────────────────────────┘
                  ↓
        ┌─ INVALID? → Error Response (4xx)
        │
        └─ VALID ↓
┌─────────────────────────────────────────────────┐
│ API Route Handler (/api/v1/*)                   │
│ - Parse request body                           │
│ - Validate with Zod schema                     │
│ - Check authorization (RBAC)                   │
└─────────────────┬───────────────────────────────┘
                  ↓
        ┌─ VALIDATION FAILED? → 400 Bad Request
        │
        └─ VALID ↓
┌─────────────────────────────────────────────────┐
│ Business Logic Layer / Services                 │
│ - Transform data                               │
│ - Apply business rules                         │
│ - Call other services                          │
│ - AI integration (if needed)                   │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ Database Query Layer (Drizzle)                  │
│ - Type-safe query construction                 │
│ - Relation loading                             │
│ - Transaction wrapping                         │
└─────────────────┬───────────────────────────────┘
                  ↓
        ╔═════════════════════════════╗
        ║   SQL Query Execution       ║
        ║   (Neon Database)           ║
        ╚═════════════════════════════╝
                  ↓
┌─────────────────────────────────────────────────┐
│ Database Response                               │
│ - Query result (rows, error, etc.)             │
└─────────────────┬───────────────────────────────┘
                  ↓
        ┌─ ERROR? → Rollback transaction
        │         → Log error
        │         → Return error response (5xx)
        │
        └─ SUCCESS ↓
┌─────────────────────────────────────────────────┐
│ Format Response                                 │
│ - Transform data to API schema                 │
│ - Include metadata (timestamps, etc.)          │
└─────────────────┬───────────────────────────────┘
                  ↓
        ╔═════════════════════════════╗
        ║   HTTP Response (200/201)   ║
        ║   Headers + Body (JSON)     ║
        ╚═════════════════════════════╝
                  ↓
        ╔═════════════════════════════╗
        ║   NETWORK (HTTPS/TLS 1.3)  ║
        ╚═════════════════════════════╝
                  ↓
┌─────────────────────────────────────────────────┐
│ TanStack Query Update                           │
│ - Update cache with new data                   │
│ - Trigger component re-render                  │
│ - Invalidate related queries                   │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ Component Re-Render                             │
│ - Display new data                             │
│ - Show success message/toast                   │
│ - Update UI state                              │
└─────────────────────────────────────────────────┘
```

### Data Fetching Flow (Query)

```
COMPONENT MOUNTS / DEPENDENCY CHANGES
        ↓
┌─────────────────────────────────────────────────┐
│ useQuery Hook Triggered                         │
│ - Check cache (in-memory)                      │
│ - Check if data is stale                       │
└─────────────────┬───────────────────────────────┘
                  ↓
        ┌─ DATA IN CACHE & NOT STALE?
        │  └─ Return cached data (instant)
        │     → Component renders with cached data
        │
        └─ DATA STALE OR NOT IN CACHE? ↓
┌─────────────────────────────────────────────────┐
│ Show Loading/Skeleton State                     │
│ - Display Skeleton component                   │
│ - "Loading..." message                         │
│ - User sees UI immediately                     │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ HTTP GET Request                                │
│ - Query parameters (filters, pagination)       │
│ - Authorization header (JWT)                   │
└─────────────────┬───────────────────────────────┘
                  ↓
        ╔═════════════════════════════╗
        ║   NETWORK (HTTPS/TLS 1.3)  ║
        ╚═════════════════════════════╝
                  ↓
┌─────────────────────────────────────────────────┐
│ Next.js API Route Handler                       │
│ - Query database with Drizzle                  │
│ - Apply filtering/pagination                   │
│ - Return JSON response                         │
└─────────────────┬───────────────────────────────┘
                  ↓
        ╔═════════════════════════════╗
        ║   HTTP Response (200/404)   ║
        ╚═════════════════════════════╝
                  ↓
┌─────────────────────────────────────────────────┐
│ TanStack Query Processing                       │
│ - Parse response                               │
│ - Update cache                                 │
│ - Calculate stale time                         │
│ - Set up garbage collection timer              │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│ Component Re-Render with Data                   │
│ - Replace skeleton with actual data            │
│ - Smooth transition animation (optional)       │
│ - Display full UI                              │
└─────────────────────────────────────────────────┘
```

---

## Application Layer Architecture

### Next.js App Router Structure

```
app/
│
├── layout.tsx
│   └── Root layout with Providers
│       - QueryClientProvider (TanStack Query)
│       - Theme provider (Tailwind)
│       - Toast/notification provider
│
├── page.tsx (Homepage)
│   └── Server Component
│       - Featured projects
│       - Achievements
│       - Stats cards
│       - Call-to-action sections
│
├── (auth)/
│   ├── login/page.tsx (Public)
│   ├── register/page.tsx (Public)
│   └── forgot-password/page.tsx (Public)
│
├── (dashboard)/
│   ├── layout.tsx (Protected, with sidebar)
│   │   └── Middleware checks authentication
│   │
│   ├── page.tsx (Student dashboard)
│   │   ├── Profile overview
│   │   ├── Recent activities
│   │   ├── Quick stats
│   │   └── Recommendations
│   │
│   ├── profile/
│   │   ├── [id]/page.tsx (View any profile)
│   │   │   └── Server Component + Client sections
│   │   ├── [id]/share.tsx (Share modal)
│   │   └── edit/page.tsx (Edit own profile)
│   │       └── Client Component with form
│   │
│   ├── projects/
│   │   ├── page.tsx (My projects list)
│   │   │   └── Client Component with TanStack Query
│   │   ├── create/page.tsx (Create project form)
│   │   ├── [id]/page.tsx (View project detail)
│   │   └── [id]/edit/page.tsx (Edit project)
│   │
│   ├── hive-projects/
│   │   ├── page.tsx (Gallery with filters)
│   │   │   ├── Filters sidebar (Client)
│   │   │   ├── Project grid (Client)
│   │   │   └── Infinite scroll (Client)
│   │   └── [id]/page.tsx (Project detail)
│   │
│   ├── skills/
│   │   ├── page.tsx (Skills board)
│   │   │   ├── Search input (Client)
│   │   │   ├── Category filters (Client)
│   │   │   └── Results list (Client)
│   │   └── [id]/page.tsx (Skill detail)
│   │
│   ├── achievements/
│   │   ├── page.tsx (Achievement wall)
│   │   └── hall-of-fame/page.tsx (Hall of fame)
│   │
│   ├── leaderboards/page.tsx (All leaderboards)
│   │   ├── Leaderboard selector (Client)
│   │   ├── Time frame filter (Client)
│   │   └── Rankings table (Client)
│   │
│   ├── opportunities/
│   │   ├── page.tsx (Browse opportunities)
│   │   │   ├── Search/filter (Client)
│   │   │   └── Results (Client)
│   │   ├── [id]/page.tsx (Opportunity detail)
│   │   └── my-applications/page.tsx (Status tracking)
│   │
│   └── analysis/page.tsx (AI skill analysis)
│       └── Client Component
│
├── admin/
│   ├── layout.tsx (Protected, admin-only)
│   ├── dashboard/page.tsx (Admin overview)
│   ├── users/page.tsx (User management)
│   ├── content/
│   │   ├── projects/page.tsx (Approve projects)
│   │   ├── achievements/page.tsx (Create awards)
│   │   └── [id]/page.tsx (Content detail)
│   ├── opportunities/page.tsx (Manage opportunities)
│   ├── gamification/page.tsx (Configure points/badges)
│   └── reports/page.tsx (Generate reports)
│
└── api/v1/
    ├── auth/
    │   ├── login/route.ts
    │   ├── register/route.ts
    │   ├── logout/route.ts
    │   └── refresh/route.ts
    │
    ├── profiles/
    │   ├── route.ts (GET /api/v1/profiles?studentId=...)
    │   ├── [id]/route.ts (GET/PUT /api/v1/profiles/[id])
    │   └── [id]/skills/route.ts (POST add skill)
    │
    ├── projects/
    │   ├── route.ts (GET list, POST create)
    │   └── [id]/
    │       ├── route.ts (GET detail, PUT edit, DELETE)
    │       └── images/route.ts (POST upload image)
    │
    ├── hive-projects/
    │   ├── route.ts (GET list with filters)
    │   ├── [id]/route.ts (GET detail)
    │   └── search/route.ts (GET full-text search)
    │
    ├── skills/
    │   ├── route.ts (GET list)
    │   └── [id]/students/route.ts (GET students with skill)
    │
    ├── endorsements/route.ts (POST create endorsement)
    │
    ├── achievements/
    │   ├── route.ts (GET list)
    │   └── [id]/award/route.ts (POST award achievement)
    │
    ├── leaderboards/
    │   ├── [type]/route.ts (GET leaderboard data)
    │   └── stats/route.ts (GET user's stats)
    │
    ├── opportunities/
    │   ├── route.ts (GET list)
    │   ├── [id]/route.ts (GET detail)
    │   └── [id]/apply/route.ts (POST apply)
    │
    ├── skill-analysis/
    │   ├── [userId]/route.ts (GET analysis)
    │   └── [userId]/refresh/route.ts (POST refresh)
    │
    └── health/route.ts (Health check)
```

---

## Database Architecture

### Schema Relationships Diagram

```
users (Student/Lecturer/Admin)
├── id (PK)
├── email (unique)
├── name
├── role (enum)
├── course
├── year
├── profileImage
└── timestamps
    ├─→ userSkills (many)
    ├─→ projects (many)
    ├─→ userCertifications (many)
    ├─→ userAchievements (many)
    ├─→ userBadges (many)
    ├─→ userPoints (one)
    ├─→ endorsementsGiven (many, as lecturer)
    ├─→ userApplications (many)
    └─→ hiveProjectMembers (many)

skills (Master list)
├── id (PK)
├── name (unique)
├── category (enum)
└── description
    ├─→ userSkills (many)
    └─→ endorsements (many)

userSkills (Many-to-many)
├── id (PK)
├── userId (FK → users)
├── skillId (FK → skills)
└── endorsementCount

endorsements (Lecturer validations)
├── id (PK)
├── lecturerId (FK → users)
├── studentId (FK → users)
├── skillId (FK → skills)
├── comment
└── createdAt
    └─→ Contributes to userSkills.endorsementCount

projects (Student-created projects)
├── id (PK)
├── userId (FK → users)
├── title
├── description
├── status (enum)
├── technologies (array)
├── demoUrl
├── githubUrl
└── timestamps
    ├─→ projectMembers (many)
    ├─→ projectImages (many)
    └─→ projectTechnologies (many)

projectMembers
├── id (PK)
├── projectId (FK → projects)
├── userId (FK → users)
└── role (enum)

projectImages
├── id (PK)
├── projectId (FK → projects)
├── imageUrl
└── displayOrder

hiveProjects (Institution projects)
├── id (PK)
├── title
├── description
├── problemStatement
├── status (enum)
├── impactCategory
├── featured
├── viewCount
└── timestamps
    ├─→ hiveProjectMembers (many)
    ├─→ hiveProjectImages (many)
    └─→ hiveProjectTechnologies (many)

hiveProjectMembers
├── id (PK)
├── projectId (FK → hiveProjects)
├── userId (FK → users)
└── role (enum)

hiveProjectImages
├── id (PK)
├── projectId (FK → hiveProjects)
├── imageUrl
└── displayOrder

certifications (Issued credentials)
├── id (PK)
├── title
├── issuer
├── dateObtained
├── certificateUrl
└── description
    └─→ userCertifications (many)

userCertifications
├── id (PK)
├── userId (FK → users)
├── certificationId (FK → certifications)
└── submittedAt

achievements (Award definitions)
├── id (PK)
├── title (enum)
├── description
├── pointsValue
├── badgeIcon
└── category
    └─→ userAchievements (many)

userAchievements
├── id (PK)
├── userId (FK → users)
├── achievementId (FK → achievements)
├── context
└── awardedAt

badges (Badge definitions)
├── id (PK)
├── name
├── description
└── icon
    └─→ userBadges (many)

userBadges
├── id (PK)
├── userId (FK → users)
├── badgeId (FK → badges)
└── unlockedAt

userPoints (Gamification)
├── id (PK)
├── userId (FK → users, unique)
├── totalPoints
├── currentLevel
└── updatedAt
    ├─→ Referenced by leaderboards
    └─→ Updated by pointsTransactions

pointsTransactions (Audit trail)
├── id (PK)
├── userId (FK → users)
├── pointsEarned
├── activityType (enum)
├── contextId (project, cert, etc.)
└── earnedAt

opportunities (Job board listings)
├── id (PK)
├── title
├── organization
├── type (enum)
├── description
├── requirements (array)
├── deadline
├── externalUrl
├── featured
├── status (enum)
└── timestamps
    └─→ userApplications (many)

userApplications
├── id (PK)
├── userId (FK → users)
├── opportunityId (FK → opportunities)
├── status (enum)
├── appliedAt
└── statusUpdatedAt

skillAnalysis (AI-generated)
├── id (PK)
├── userId (FK → users)
├── suggestedSkills (JSON)
├── careerPathways (JSON)
├── analysisScore
├── generatedAt
└── expiresAt
```

### Database Indexes Strategy

```sql
-- High-Priority Indexes (Performance Critical)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_userSkills_skillId ON userSkills(skillId);
CREATE INDEX idx_userSkills_endorsementCount ON userSkills(endorsementCount DESC);
CREATE INDEX idx_projects_userId ON projects(userId);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_hiveProjects_featured ON hiveProjects(featured);
CREATE INDEX idx_hiveProjects_status ON hiveProjects(status);
CREATE INDEX idx_userAchievements_userId ON userAchievements(userId);
CREATE INDEX idx_userBadges_userId ON userBadges(userId);
CREATE INDEX idx_pointsTransactions_userId ON pointsTransactions(userId);
CREATE INDEX idx_userPoints_totalPoints ON userPoints(totalPoints DESC);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_userApplications_userId ON userApplications(userId);
CREATE INDEX idx_userApplications_status ON userApplications(status);
CREATE INDEX idx_skillAnalysis_userId ON skillAnalysis(userId);

-- Full-Text Search Indexes
CREATE INDEX idx_projects_search ON projects USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_hiveProjects_search ON hiveProjects USING GIN(to_tsvector('english', title || ' ' || description));

-- Composite Indexes
CREATE INDEX idx_endorsements_student_skill ON endorsements(studentId, skillId);
CREATE INDEX idx_projectMembers_project_user ON projectMembers(projectId, userId);
CREATE INDEX idx_hiveProjectMembers_project_user ON hiveProjectMembers(projectId, userId);
```

### Connection Management

```
┌──────────────────────────────────────┐
│  Neon Connection Pool                │
├──────────────────────────────────────┤
│ Max Connections: 20                  │
│ Idle Timeout: 15 minutes             │
│ Connection Timeout: 30 seconds       │
│ Max Query Time: 30 seconds           │
│                                      │
│ Connections by type:                 │
│ - Read queries: 10                   │
│ - Write queries: 8                   │
│ - Admin: 2                           │
└──────────────────────────────────────┘
```

---

## API Architecture

### RESTful API Design

```
Base URL: https://api.hive-showcase.com/api/v1

Authentication:
  Header: Authorization: Bearer {jwt_token}
  Token Expiry: 24 hours
  Refresh: POST /auth/refresh

Response Format (Standard):
{
  "success": boolean,
  "data": T | null,
  "error": {
    "code": string,
    "message": string,
    "details": object | null
  },
  "meta": {
    "timestamp": ISO8601,
    "requestId": string
  }
}

Status Codes:
  200 OK - Successful GET/PUT
  201 Created - Successful POST (resource created)
  204 No Content - Successful DELETE
  400 Bad Request - Validation error
  401 Unauthorized - Missing/invalid token
  403 Forbidden - Insufficient permissions
  404 Not Found - Resource not found
  409 Conflict - Duplicate resource
  422 Unprocessable Entity - Semantic error
  429 Too Many Requests - Rate limit exceeded
  500 Internal Server Error - Server error
  503 Service Unavailable - Service down

Pagination:
  Query: ?page=1&limit=10
  Response: {
    data: T[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      hasMore: boolean
    }
  }

Filtering:
  Query: ?status=active&category=backend
  Supported filters defined per endpoint

Sorting:
  Query: ?sort=name:asc,createdAt:desc
  Default sort defined per endpoint

Timeouts:
  Request timeout: 30 seconds
  Database query timeout: 30 seconds
  API response timeout: 60 seconds
```

### API Endpoint Categories

```
AUTHENTICATION
├── POST /auth/register
├── POST /auth/login
├── POST /auth/logout
├── POST /auth/refresh
└── POST /auth/forgot-password

USER PROFILES
├── GET /profiles (list with search)
├── GET /profiles/{id}
├── PUT /profiles/{id}
├── POST /profiles/{id}/skills
└── DELETE /profiles/{id}/skills/{skillId}

PROJECTS
├── GET /projects (my projects or filter)
├── POST /projects (create)
├── GET /projects/{id}
├── PUT /projects/{id} (update)
├── DELETE /projects/{id}
├── POST /projects/{id}/images (upload)
├── DELETE /projects/{id}/images/{imageId}
└── POST /projects/{id}/publish

HIVE PROJECTS
├── GET /hive-projects (gallery with filters)
├── POST /hive-projects (create, admin only)
├── GET /hive-projects/{id}
├── PUT /hive-projects/{id} (admin)
├── DELETE /hive-projects/{id} (admin)
├── GET /hive-projects/search (full-text search)
└── POST /hive-projects/{id}/feature (admin)

SKILLS
├── GET /skills (search/list)
├── POST /skills (create new skill, admin)
├── GET /skills/{id}
├── GET /skills/{id}/students (students with skill)
└── POST /endorsements (lecturer endorses)

ACHIEVEMENTS
├── GET /achievements (timeline)
├── POST /achievements/{id}/award (lecturer)
├── GET /hall-of-fame (featured achievements)
└── PUT /achievements/{id} (admin)

GAMIFICATION
├── GET /users/{id}/points (user stats)
├── GET /leaderboards/{type} (rankings)
│   ├── ?timeframe=this_month|this_semester|all_time
│   ├── Types: most_active | most_skilled | most_projects | most_certifications
│   └── Returns: top 10-100 with user rank
└── POST /points/transaction (admin, manual award)

OPPORTUNITIES
├── GET /opportunities (browse with filters)
├── POST /opportunities (create, admin)
├── GET /opportunities/{id}
├── PUT /opportunities/{id} (admin)
├── DELETE /opportunities/{id} (admin)
├── POST /opportunities/{id}/apply (student)
├── GET /opportunities/{id}/applications (admin)
└── PUT /opportunities/{id}/applications/{appId} (admin)

AI ANALYSIS
├── GET /skill-analysis/{id} (get analysis)
├── POST /skill-analysis/{id}/refresh (refresh)
└── POST /skill-analysis/batch (admin, batch refresh)

ADMIN
├── GET /admin/users (all users)
├── PUT /admin/users/{id}/role (change role)
├── DELETE /admin/users/{id} (deactivate)
├── GET /admin/content (pending content)
├── PUT /admin/content/{type}/{id}/approve
├── GET /admin/reports (platform statistics)
└── POST /admin/reports/export

HEALTH
├── GET /health (service status)
└── GET /health/db (database status)
```

---

## Frontend Architecture

### Component Hierarchy

```
Root (app/layout.tsx)
├── Providers
│   ├── QueryClientProvider
│   ├── ThemeProvider
│   └── ToastProvider
│
└── Routes
    ├── Public Routes (Homepage, Auth)
    │   ├── /
    │   ├── /login
    │   ├── /register
    │   └── /forgot-password
    │
    ├── Protected Routes (Dashboard)
    │   ├── DashboardLayout
    │   │   ├── Header
    │   │   ├── Sidebar
    │   │   └── Main Content
    │   │
    │   ├── /dashboard (Student Dashboard)
    │   ├── /profile/[id] (View Profile)
    │   ├── /profile/edit (Edit Profile)
    │   ├── /projects (My Projects)
    │   ├── /projects/create (New Project)
    │   ├── /projects/[id] (Project Detail)
    │   ├── /hive-projects (Gallery)
    │   ├── /hive-projects/[id] (Detail)
    │   ├── /skills (Skills Board)
    │   ├── /achievements (Achievement Wall)
    │   ├── /leaderboards (Leaderboards)
    │   ├── /opportunities (Opportunity Board)
    │   └── /analysis (AI Analysis)
    │
    ├── Admin Routes
    │   ├── AdminLayout
    │   ├── /admin/dashboard
    │   ├── /admin/users
    │   ├── /admin/content
    │   ├── /admin/opportunities
    │   └── /admin/reports
    │
    └── API Routes (/api/v1/*)
```

### State Management Strategy

```
COMPONENT-LEVEL STATE (useState)
├── Form inputs
├── UI toggles (modals, dropdowns)
├── Local selections
└── Temporary UI state

CONTEXT API (For shared values)
├── Current user/authentication
├── Theme preferences
└── User settings

TANSTACK QUERY (Server State)
├── API Data Fetching
├── Caching
├── Mutations
├── Background sync
└── Data invalidation

LOCAL STORAGE (Persistent)
├── User preferences
├── Theme selection
├── Recently viewed
└── Draft forms (optional)
```

### Data Fetching Pattern in Components

```typescript
// Custom hook pattern
export function useStudentProfile(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profiles', id],
    queryFn: () => fetch(`/api/v1/profiles/${id}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  return { profile: data, isLoading, error };
}

// Component usage
export function ProfileCard({ studentId }: { studentId: string }) {
  const { profile, isLoading, error } = useStudentProfile(studentId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert message={error.message} />;
  if (!profile) return <EmptyState message="Profile not found" />;

  return <div>{profile.name}</div>;
}
```

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────┐
│ Authentication Flow                         │
├─────────────────────────────────────────────┤
│                                             │
│ 1. User logs in                            │
│    POST /auth/login                        │
│    { email, password }                     │
│                                             │
│ 2. Server validates credentials            │
│    - Check user exists                     │
│    - Verify password hash                  │
│    - Check account status                  │
│                                             │
│ 3. Generate JWT token                      │
│    {                                       │
│      sub: userId,                          │
│      email: user.email,                    │
│      role: user.role,                      │
│      iat: issued_at,                       │
│      exp: issued_at + 24h,                 │
│      iss: 'hive-showcase'                  │
│    }                                       │
│                                             │
│ 4. Return tokens                           │
│    {                                       │
│      accessToken: jwt,                     │
│      refreshToken: jwt,                    │
│      expiresIn: 86400                      │
│    }                                       │
│                                             │
│ 5. Client stores tokens                    │
│    - Access: Memory (not localStorage)     │
│    - Refresh: HttpOnly cookie              │
│                                             │
│ 6. Client sends with requests              │
│    Header: Authorization: Bearer {token}   │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Authorization (RBAC)                        │
├─────────────────────────────────────────────┤
│                                             │
│ Roles:                                      │
│ - student (default)                        │
│ - lecturer (can endorse, award)            │
│ - admin (full access)                      │
│                                             │
│ Permissions by role:                       │
│                                             │
│ STUDENT                                    │
│ ├── Read own profile                       │
│ ├── Update own profile                     │
│ ├── Create/edit own projects               │
│ ├── Read public profiles                   │
│ ├── Browse projects                        │
│ ├── Browse skills board                    │
│ ├── View leaderboards                      │
│ ├── Apply for opportunities                │
│ └── View own analysis                      │
│                                             │
│ LECTURER                                   │
│ ├── All student permissions                │
│ ├── Endorse student skills                 │
│ ├── Award achievement badges               │
│ ├── Verify certifications                  │
│ ├── View class analytics                   │
│ └── Create competitions                    │
│                                             │
│ ADMIN                                      │
│ ├── All lecturer permissions               │
│ ├── Manage users (CRUD)                    │
│ ├── Approve content                        │
│ ├── Feature projects                       │
│ ├── Manage opportunities                   │
│ ├── Configure gamification                 │
│ ├── Generate reports                       │
│ └── Access audit logs                      │
│                                             │
└─────────────────────────────────────────────┘
```

### Data Security

```
┌─────────────────────────────────────────────┐
│ Data Encryption                             │
├─────────────────────────────────────────────┤
│                                             │
│ In Transit (TLS 1.3)                       │
│ ├── All HTTP requests → HTTPS              │
│ ├── Certificate: Let's Encrypt             │
│ ├── HSTS header: 1 year                    │
│ └── Cipher suite: Modern (TLS 1.3)         │
│                                             │
│ At Rest (Neon default)                     │
│ ├── Database encryption: Yes (default)     │
│ ├── Backups: Encrypted                     │
│ ├── Sensitive fields:                      │
│ │   - Passwords: bcrypt (cost 12)          │
│ │   - SSNs: AES-256-CBC (if stored)        │
│ │   - API keys: Env variables              │
│ └── File storage: Azure encryption         │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Input Validation & Sanitization             │
├─────────────────────────────────────────────┤
│                                             │
│ 1. Client-side validation (UX)             │
│    - Zod schemas on forms                  │
│    - Real-time error messages              │
│                                             │
│ 2. Server-side validation (Security)       │
│    - Zod schema validation                 │
│    - Type checking                         │
│    - Length validation                     │
│    - Pattern matching (email, URLs)        │
│    - Enum validation                       │
│                                             │
│ 3. SQL Injection Prevention                │
│    - Parameterized queries (Drizzle)       │
│    - No string interpolation               │
│    - Prepared statements                   │
│                                             │
│ 4. XSS Prevention                          │
│    - Content Security Policy (CSP)         │
│    - React escapes by default              │
│    - No dangerouslySetInnerHTML            │
│                                             │
│ 5. CSRF Protection                         │
│    - SameSite cookie policy                │
│    - CSRF token for state-changing ops    │
│                                             │
└─────────────────────────────────────────────┘
```

### Compliance & Audit

```
POPIA Compliance
├── Data Collection
│   ├── Only collect necessary data
│   ├── User consent for storage
│   ├── Privacy policy clarity
│   └── Cookie consent banner
│
├── Data Retention
│   ├── Inactive accounts: 2 years
│   ├── Deleted data: Anonymized
│   ├── Audit logs: 1 year
│   └── Backups: 30 days
│
├── Data Access
│   ├── Principle of least privilege
│   ├── Role-based access control
│   ├── User can request own data
│   └── User can request deletion
│
├── Data Security
│   ├── Encryption in transit & at rest
│   ├── Regular security audits
│   ├── Incident response plan
│   └── Breach notification (72 hours)
│
└── Third-Party Services
    ├── OpenAI: Terms of service review
    ├── Azure: Data residency compliance
    ├── Vercel: GDPR agreement
    └── No external sharing without consent

Audit Logging
├── All data modifications logged
├── Logs include: who, what, when, why
├── Immutable audit trail (append-only)
├── 1-year retention policy
└── Admin access for compliance review
```

---

## Deployment Architecture

### Infrastructure Topology

```
┌──────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  DNS (Route 53)    │
        │  hive-showcase.com │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  CDN (Azure CDN)   │
        │  (Static assets)   │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Vercel Edge       │
        │  (Global locations)│
        └────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  Vercel Serverless Node.js │
    │  (Next.js Application)     │
    │  - Multiple regions        │
    │  - Auto-scaling            │
    │  - Redundancy              │
    └────────┬───────────────────┘
             │
    ┌────────┴──────────────────────────┐
    │                                   │
    ▼                                   ▼
┌──────────────┐              ┌──────────────────────┐
│  Neon        │              │  Azure Blob Storage  │
│  PostgreSQL  │              │  (File storage)      │
│              │              │  - Redundancy (GRS)  │
│ - Pooling    │              │  - CDN integration   │
│ - HA         │              │  - Versioning        │
│ - Backups    │              └──────────────────────┘
│ - Monitoring │
└──────────────┘

External Services
├── OpenAI API (Skill analysis)
├── SendGrid (Email notifications)
├── Sentry (Error tracking)
├── Datadog (Monitoring)
└── GitHub (Version control)
```

### Deployment Pipeline

```
┌──────────────────────────────────────────────┐
│ Developer pushes code to GitHub              │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ GitHub Actions       │
        │ (CI Pipeline)        │
        │                      │
        │ 1. Checkout code     │
        │ 2. Install deps      │
        │ 3. Run tests         │
        │ 4. Lint check        │
        │ 5. Build check       │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼ FAIL                ▼ SUCCESS
    Notify Dev           Merge to main
    Stop deployment      (auto-merge if approved)
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Vercel Webhook       │
                    │ (Deploy Trigger)     │
                    │                      │
                    │ 1. Build              │
                    │ 2. Test               │
                    │ 3. Optimize           │
                    │ 4. Deploy             │
                    └──────────┬────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼ FAIL                ▼ SUCCESS
              Rollback to                Deploy to
              previous version           Production
                                               │
                                               ▼
                                   ┌──────────────────────┐
                                   │ Production           │
                                   │ - Health check       │
                                   │ - Smoke tests        │
                                   │ - Monitor metrics    │
                                   └──────────────────────┘

Deployment Frequency
├── Development: Every commit to dev
├── Staging: Every merged PR
└── Production: Scheduled (or manual with approval)
```

### Environment Configuration

```
Development Environment
├── Next.js (dev mode)
├── Local PostgreSQL or Neon dev branch
├── Mock/test APIs
├── Hot reload enabled
└── Debug logging on

Staging Environment
├── Same as production (pre-production clone)
├── Neon staging database
├── Real APIs (rate limited)
├── Performance monitoring
└── Smoke test suite

Production Environment
├── Next.js (production mode, optimized)
├── Neon production database
├── Real APIs (full capacity)
├── Error tracking (Sentry)
├── Performance monitoring (Datadog)
├── Backup strategy enabled
└── Disaster recovery procedures
```

---

## Scalability & Performance

### Performance Optimization Strategies

```
FRONTEND
├── Code Splitting
│   ├── Route-based code splitting (Next.js default)
│   ├── Component lazy loading
│   └── Dynamic imports for heavy components
│
├── Caching Strategy
│   ├── TanStack Query: 5-15 min cache (data dependent)
│   ├── HTTP caching: 1 hour for public assets
│   ├── Browser cache: 1 year for versioned assets
│   └── Service Worker: Offline support (optional)
│
├── Image Optimization
│   ├── Next.js Image component (auto-optimization)
│   ├── WebP format (automatic fallback)
│   ├── Responsive images (srcset)
│   └── Lazy loading (loading="lazy")
│
├── Rendering Strategy
│   ├── Server Components: For static/SEO content
│   ├── Client Components: For interactive sections
│   ├── Streaming: Large data sets (optional)
│   └── ISR: Static generation with revalidation
│
└── Bundle Size
    ├── Target: < 200KB initial JS
    ├── Monitoring: Next.js analytics
    ├── Tree-shaking enabled
    └── Minification: Automatic

DATABASE
├── Query Optimization
│   ├── Indexes on frequently queried columns
│   ├── Relation loading (join optimization)
│   ├── Pagination (avoid loading all data)
│   └── Projection (select only needed columns)
│
├── Connection Management
│   ├── Connection pooling (Neon default)
│   ├── Max 20 concurrent connections
│   ├── Idle timeout: 15 minutes
│   └── Query timeout: 30 seconds
│
├── Scaling Strategy
│   ├── Read replicas: For heavy read queries
│   ├── Caching layer: TanStack Query (client)
│   ├── Database caching: Redis (future)
│   └── Archiving: Old data migration
│
└── Monitoring
    ├── Query performance tracking
    ├── Slow query log analysis
    ├── Connection pool monitoring
    └── Backup success verification

API
├── Rate Limiting
│   ├── 100 requests/minute per user
│   ├── 1000 requests/minute per IP (public)
│   ├── Backoff strategy (exponential)
│   └── Clear rate limit headers
│
├── Caching
│   ├── ETag headers for responses
│   ├── Cache-Control headers
│   ├── 304 Not Modified support
│   └── Vary header for compression
│
├── Compression
│   ├── gzip/brotli: Automatic (Vercel)
│   ├── Response size: < 50KB (target)
│   └── Streaming for large responses
│
└── Async Processing
    ├── Heavy tasks: Background jobs (future)
    ├── Email: Queue-based (SendGrid)
    ├── AI analysis: Batch processing (nightly)
    └── Reports: Generated asynchronously
```

### Performance Targets

```
FRONTEND METRICS (Web Vitals)
├── Largest Contentful Paint (LCP): < 2.5s
├── First Input Delay (FID): < 100ms
├── Cumulative Layout Shift (CLS): < 0.1
├── First Contentful Paint (FCP): < 1.8s
└── Time to Interactive (TTI): < 3.8s

API RESPONSE METRICS
├── p50 (median): < 200ms
├── p95: < 500ms
├── p99: < 1000ms
└── Error rate: < 0.1%

DATABASE METRICS
├── Query p50: < 50ms
├── Query p95: < 200ms
├── Connection pool utilization: < 80%
└── Backup duration: < 30 minutes

INFRASTRUCTURE METRICS
├── Uptime: > 99.5%
├── TTFB (Time to First Byte): < 200ms
├── CDN hit ratio: > 80%
└── SSL handshake time: < 100ms
```

---

## Integration Points

### Third-Party Services

```
AUTHENTICATION & AUTHORIZATION
├── Service: Auth0 or Firebase Auth (future)
├── Integration: JWT tokens
├── Data sync: User metadata
└── Failure mode: Fallback to previous session

AI & ML SERVICES
├── Service: OpenAI API (GPT-4 Turbo)
├── Endpoint: POST /v1/chat/completions
├── Rate limit: 3500 requests/minute
├── Caching: 7-day cache on results
├── Cost: ~$0.03-0.15 per analysis
├── Failure mode: Show cached result + "outdated" badge
└── Alternative: Azure Cognitive Services

EMAIL & NOTIFICATIONS
├── Service: SendGrid
├── Rate limit: 100,000 emails/day
├── Templates: Notification emails
├── Webhook: Delivery tracking
├── Failure mode: Retry with exponential backoff
└── Monitor: SendGrid dashboard

FILE STORAGE
├── Service: Azure Blob Storage
├── Container: hive-showcase-production
├── Size limit: 500MB per user
├── Format: Images (JPEG, PNG, WebP), Videos (MP4)
├── Access: Via SAS tokens (signed URLs)
└── Failure mode: Show placeholder + error message

ANALYTICS & MONITORING
├── Service: Vercel Analytics (built-in)
├── Service: Datadog (infrastructure)
├── Service: Sentry (error tracking)
├── Metrics: Page views, errors, performance
├── Dashboard: Real-time monitoring
└── Alerts: Slack notifications on errors

PAYMENT (Future)
├── Service: Stripe (for paid features)
├── Integration: Webhook handling
├── PCI compliance: Not storing card data
└── Failure mode: Graceful degradation
```

### External API Integrations

```
OpenAI Integration Pattern

1. Trigger: User views skill analysis
   GET /api/v1/skill-analysis/{userId}

2. Check cache (skillAnalysis table)
   ├── If valid & not expired → Return cached result
   └── If expired or missing → Proceed to step 3

3. Call OpenAI API
   POST https://api.openai.com/v1/chat/completions
   {
     "model": "gpt-4-turbo",
     "messages": [
       {
         "role": "user",
         "content": "Analyze this student profile and recommend skills..."
       }
     ],
     "temperature": 0.7,
     "max_tokens": 1000
   }

4. Handle response
   ├── Parse JSON response
   ├── Extract suggestions
   ├── Validate response structure
   └── Store in skillAnalysis table

5. Return to client
   {
     "suggestedSkills": [...],
     "careerPathways": [...],
     "analysisScore": 88,
     "generatedAt": "2024-06-21T10:00:00Z"
   }

6. Error handling
   ├── OpenAI down: Return cached result (if available)
   ├── Rate limit: Queue and retry with backoff
   ├── Invalid input: Return validation error
   └── Timeout: Return error after 10s (don't retry)

Cost Management
├── Monthly budget: $500
├── Daily tracking: API usage monitoring
├── Optimization: Cache results aggressively
└── Alert: Notify if > $400 monthly
```

---

## Error Handling & Observability

### Error Handling Strategy

```
┌─────────────────────────────────────────────┐
│ Error Classification                        │
├─────────────────────────────────────────────┤
│                                             │
│ CLIENT ERRORS (4xx)                        │
│ ├── 400 Bad Request                        │
│ │   └── Invalid input, validation failed   │
│ ├── 401 Unauthorized                       │
│ │   └── Missing or invalid token           │
│ ├── 403 Forbidden                          │
│ │   └── Insufficient permissions           │
│ └── 404 Not Found                          │
│     └── Resource doesn't exist             │
│                                             │
│ SERVER ERRORS (5xx)                        │
│ ├── 500 Internal Server Error              │
│ │   └── Unexpected error in code           │
│ ├── 503 Service Unavailable                │
│ │   └── Database/external service down     │
│ └── 504 Gateway Timeout                    │
│     └── Request took too long              │
│                                             │
└─────────────────────────────────────────────┘

Error Response Format

{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "constraint": "email_pattern"
    }
  },
  "meta": {
    "timestamp": "2024-06-21T10:00:00Z",
    "requestId": "req_abc123xyz"
  }
}

Error Codes (Custom)
├── VALIDATION_ERROR
├── AUTHENTICATION_ERROR
├── AUTHORIZATION_ERROR
├── NOT_FOUND_ERROR
├── CONFLICT_ERROR
├── RATE_LIMIT_ERROR
├── EXTERNAL_SERVICE_ERROR
├── DATABASE_ERROR
└── INTERNAL_SERVER_ERROR

Client-Side Error Handling

1. Network Error
   ├── Retry with exponential backoff
   ├── Show "Connection lost" message
   └── Offline mode (if applicable)

2. API Error (4xx, 5xx)
   ├── Parse error response
   ├── Show user-friendly message
   ├── Log to Sentry
   └── Offer retry or help

3. Form Validation Error
   ├── Highlight invalid fields
   ├── Show inline error messages
   ├── Focus on first invalid field
   └── Disable submit button

4. Component Error
   ├── Error boundary catches
   ├── Show error screen
   ├── Log to Sentry
   └── Offer retry button
```

### Observability & Monitoring

```
┌─────────────────────────────────────────────┐
│ Monitoring Stack                            │
├─────────────────────────────────────────────┤
│                                             │
│ LOGS                                        │
│ ├── Application Logs (Winston/Pino)        │
│ │   ├── Request logs (endpoint, method)    │
│ │   ├── Error logs (stack trace)           │
│ │   ├── Database logs (queries, times)     │
│ │   └── External API logs (calls, errors)  │
│ │                                           │
│ ├── Aggregation: Datadog                   │
│ ├── Retention: 30 days                     │
│ └── Search: Full-text search capability    │
│                                             │
│ METRICS                                     │
│ ├── Application Metrics                    │
│ │   ├── Request count (endpoint)           │
│ │   ├── Response time (p50, p95, p99)      │
│ │   ├── Error rate (% by endpoint)         │
│ │   ├── Cache hit rate                     │
│ │   └── Active users (concurrent)          │
│ │                                           │
│ ├── Database Metrics                       │
│ │   ├── Query count                        │
│ │   ├── Query time (p50, p95, p99)         │
│ │   ├── Connection pool utilization        │
│ │   ├── Slow query count                   │
│ │   └── Transaction count                  │
│ │                                           │
│ ├── Infrastructure Metrics                 │
│ │   ├── CPU utilization                    │
│ │   ├── Memory usage                       │
│ │   ├── Disk usage                         │
│ │   ├── Network I/O                        │
│ │   └── Uptime (%)                         │
│ │                                           │
│ ├── Business Metrics                       │
│ │   ├── Active users                       │
│ │   ├── New users (daily)                  │
│ │   ├── Projects created (daily)           │
│ │   ├── Applications submitted             │
│ │   └── Conversion rate (profiles → projects)
│ │                                           │
│ └── Aggregation: Datadog / Vercel Analytics
│                                             │
│ TRACING                                     │
│ ├── Distributed tracing (optional)         │
│ ├── Request ID propagation                 │
│ ├── Service dependency mapping             │
│ └── Latency analysis (per service)         │
│                                             │
│ ALERTS                                      │
│ ├── Error rate > 1% (critical)             │
│ ├── Response time > 1s p95 (warning)       │
│ ├── Database down (critical)               │
│ ├── Disk usage > 80% (warning)             │
│ ├── API quota exceeded (warning)           │
│ └── Notification: Slack, email             │
│                                             │
└─────────────────────────────────────────────┘

Dashboard Setup

Vercel Dashboard
├── Deployments
├── Performance
├── Error tracking
└── Analytics

Datadog Dashboard
├── Application overview
├── Database performance
├── Error rates
├── User activity
└── Cost tracking

Custom Dashboards
├── Homepage: Key metrics at a glance
├── Health: Service status + recent errors
├── Performance: API response times
├── Users: Adoption metrics
└── Business: KPI tracking
```

---

## Conclusion

The HIVE Showcase Platform architecture is designed to be:

1. **Scalable**: Serverless infrastructure with auto-scaling
2. **Reliable**: Database redundancy, backup strategy, error handling
3. **Performant**: Caching, optimization, CDN integration
4. **Secure**: End-to-end encryption, RBAC, compliance
5. **Maintainable**: Clear separation of concerns, type safety
6. **Observable**: Comprehensive logging, monitoring, alerting

This architecture supports the platform's growth from MVP to a fully-featured educational showcase system with millions of users.

---
