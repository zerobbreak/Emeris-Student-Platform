# Feature 01 — Authentication & User Profiles

**Platform:** HIVE Showcase Platform  
**Stack:** Next.js 14 (App Router) · Neon · Drizzle · TanStack Query · ShadCN  
**Sprint:** 1 (Week 1–2)  
**Status:** 🔴 Not Started  
**Priority:** P0 — Blocks all other features

---

## Overview

Authentication and user profiles are the foundation of the entire HIVE platform. Every other feature — gamification, projects, skills, achievements, opportunities — relies on knowing who the user is and what role they hold. This feature establishes:

- How users register, log in, and stay authenticated
- What a user's profile looks like in the database
- How roles (Student / Lecturer / Admin) control access
- What a student's public-facing profile page displays

Nothing else gets built until this works completely.

---

## Scope

### In Scope (This Feature)
- User registration (email + password)
- User login and logout
- JWT access token + HTTP-only refresh token
- Middleware-level route protection
- Role-based access control (Student, Lecturer, Admin)
- Profile creation on registration
- Profile view page (public)
- Profile edit page (own profile only)
- Profile image upload
- Basic contact links (GitHub, LinkedIn)
- Skills tagging on profile
- Student stats display (project count, points, level)

### Out of Scope (Later Features)
- Social OAuth (Google, GitHub login) — Phase 2
- Email verification — Phase 2
- Password reset flow — Phase 2
- Lecturer endorsements on profile — Feature 03 (Skills Board)
- Achievement display on profile — Feature 04 (Achievements)
- AI analysis widget on profile — Feature 07 (AI Analyser)
- Points and badge display — Feature 05 (Gamification)

---

## User Stories

| ID | Role | Story | Acceptance Criteria |
|----|------|-------|---------------------|
| US-01 | Student | I want to register with my email so I can create my profile | Registration form creates a user and redirects to onboarding |
| US-02 | Student | I want to log in securely so I can access my dashboard | Valid credentials return a JWT and redirect to dashboard |
| US-03 | Student | I want to stay logged in across page refreshes | Refresh token silently renews access token |
| US-04 | Student | I want to edit my profile so I can keep it up to date | Changes persist after save and reflect on public profile |
| US-05 | Student | I want to add skills to my profile so others can discover me | Skills appear on public profile and Skills Board |
| US-06 | Student | I want a public profile URL I can share | `/profile/[id]` is publicly accessible without login |
| US-07 | Lecturer | I want to register with a lecturer role so I can access moderation tools | Lecturer role gives access to endorsement and award tools |
| US-08 | Admin | I want to log in and access the admin panel | Admin role gates the `/admin` route group |
| US-09 | Guest | I want to view a student's public profile without registering | Public profile page renders without authentication |

---

## Database Schema

### Tables to Create

#### `users`

```typescript
export const users = pgTable('users', {
  id:           text('id').primaryKey().$defaultFn(() => createId()),
  email:        varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name:         varchar('name', { length: 255 }).notNull(),
  role:         varchar('role', { length: 20 }).default('student').notNull(),
  // role: 'student' | 'lecturer' | 'admin'

  // Profile fields
  bio:          text('bio'),
  profileImage: text('profile_image'),
  course:       varchar('course', { length: 100 }),
  year:         integer('year'),           // 1 | 2 | 3 | 4
  location:     varchar('location', { length: 100 }),

  // Contact links
  githubUrl:    text('github_url'),
  linkedinUrl:  text('linkedin_url'),

  // Platform meta
  isActive:     boolean('is_active').default(true).notNull(),
  isOnboarded:  boolean('is_onboarded').default(false).notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

#### `sessions`

```typescript
export const sessions = pgTable('sessions', {
  id:           text('id').primaryKey().$defaultFn(() => createId()),
  userId:       text('user_id')
                  .references(() => users.id, { onDelete: 'cascade' })
                  .notNull(),
  refreshToken: text('refresh_token').unique().notNull(),
  expiresAt:    timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  userAgent:    text('user_agent'),
  ipAddress:    varchar('ip_address', { length: 45 }),
});
```

#### `skills`

```typescript
export const skills = pgTable('skills', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  name:        varchar('name', { length: 100 }).unique().notNull(),
  // e.g. 'React', 'Python', 'Docker'
  category:    varchar('category', { length: 50 }).notNull(),
  // 'frontend' | 'backend' | 'cloud' | 'data' | 'design' | 'soft'
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

#### `userSkills`

```typescript
export const userSkills = pgTable('user_skills', {
  id:               text('id').primaryKey().$defaultFn(() => createId()),
  userId:           text('user_id')
                      .references(() => users.id, { onDelete: 'cascade' })
                      .notNull(),
  skillId:          text('skill_id')
                      .references(() => skills.id, { onDelete: 'cascade' })
                      .notNull(),
  endorsementCount: integer('endorsement_count').default(0).notNull(),
  addedAt:          timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate user-skill pairs
  uniq: unique().on(table.userId, table.skillId),
}));
```

### Relations

```typescript
export const usersRelations = relations(users, ({ many }) => ({
  sessions:    many(sessions),
  userSkills:  many(userSkills),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields:     [sessions.userId],
    references: [users.id],
  }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user:  one(users,  { fields: [userSkills.userId],  references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}));
```

### Indexes

```typescript
export const userEmailIdx        = index('idx_users_email').on(users.email);
export const userRoleIdx         = index('idx_users_role').on(users.role);
export const sessionUserIdx      = index('idx_sessions_user_id').on(sessions.userId);
export const sessionTokenIdx     = index('idx_sessions_refresh_token').on(sessions.refreshToken);
export const userSkillUserIdx    = index('idx_user_skills_user_id').on(userSkills.userId);
export const userSkillSkillIdx   = index('idx_user_skills_skill_id').on(userSkills.skillId);
export const skillCategoryIdx    = index('idx_skills_category').on(skills.category);
```

### Seed Data — Skills Master List

```typescript
// drizzle/seeds/skills.ts
export const seedSkills = [
  // Frontend
  { name: 'HTML/CSS',     category: 'frontend' },
  { name: 'JavaScript',   category: 'frontend' },
  { name: 'TypeScript',   category: 'frontend' },
  { name: 'React',        category: 'frontend' },
  { name: 'Next.js',      category: 'frontend' },
  { name: 'Vue.js',       category: 'frontend' },
  { name: 'Tailwind CSS', category: 'frontend' },
  // Backend
  { name: 'Node.js',      category: 'backend'  },
  { name: 'Python',       category: 'backend'  },
  { name: 'C#',           category: 'backend'  },
  { name: 'Java',         category: 'backend'  },
  { name: 'FastAPI',      category: 'backend'  },
  { name: 'ASP.NET Core', category: 'backend'  },
  { name: 'Spring Boot',  category: 'backend'  },
  { name: 'PostgreSQL',   category: 'backend'  },
  { name: 'SQL',          category: 'backend'  },
  // Cloud & DevOps
  { name: 'Azure',        category: 'cloud'    },
  { name: 'AWS',          category: 'cloud'    },
  { name: 'Docker',       category: 'cloud'    },
  { name: 'CI/CD',        category: 'cloud'    },
  { name: 'Git',          category: 'cloud'    },
  // Data & AI
  { name: 'Data Science',     category: 'data' },
  { name: 'Machine Learning', category: 'data' },
  { name: 'Power BI',         category: 'data' },
  { name: 'Excel/Sheets',     category: 'data' },
  // Design
  { name: 'UI/UX Design', category: 'design'  },
  { name: 'Figma',         category: 'design'  },
  // Specialist
  { name: 'Cybersecurity', category: 'specialist' },
  { name: 'Networking',    category: 'specialist' },
  { name: '.NET MAUI',     category: 'specialist' },
];
```

---

## API Routes

### Auth Routes

#### `POST /api/v1/auth/register`

**Description:** Create new user account and profile  
**Auth Required:** No  
**Rate Limit:** 5 requests / 15 minutes per IP

**Request Body:**
```typescript
{
  name:     string  // min 2, max 100
  email:    string  // valid email format
  password: string  // min 8 chars
  role:     'student' | 'lecturer'  // admin not self-registerable
}
```

**Response `201`:**
```typescript
{
  user: {
    id:    string
    name:  string
    email: string
    role:  string
  }
  accessToken:  string   // JWT, 24h expiry
  // refreshToken set as httpOnly cookie
}
```

**Errors:**
- `400` — Validation failed (missing fields, bad email, weak password)
- `409` — Email already registered

---

#### `POST /api/v1/auth/login`

**Description:** Authenticate user and issue tokens  
**Auth Required:** No  
**Rate Limit:** 10 requests / 15 minutes per IP

**Request Body:**
```typescript
{
  email:    string
  password: string
}
```

**Response `200`:**
```typescript
{
  user: {
    id:    string
    name:  string
    email: string
    role:  string
  }
  accessToken: string
  // refreshToken set as httpOnly cookie
}
```

**Errors:**
- `400` — Missing fields
- `401` — Invalid email or password (never specify which)
- `403` — Account deactivated

---

#### `POST /api/v1/auth/refresh`

**Description:** Exchange refresh token for new access token  
**Auth Required:** No (reads httpOnly cookie)

**Response `200`:**
```typescript
{
  accessToken: string  // new JWT
}
```

**Errors:**
- `401` — Refresh token missing, invalid, or expired

---

#### `POST /api/v1/auth/logout`

**Description:** Invalidate refresh token and clear cookie  
**Auth Required:** Yes

**Response `200`:**
```typescript
{ success: true }
```

---

### Profile Routes

#### `GET /api/v1/profiles/:id`

**Description:** Get a student's public profile  
**Auth Required:** No (public route)

**Query Params:**
- `include` — comma-separated: `skills`, `stats` (default: both)

**Response `200`:**
```typescript
{
  id:           string
  name:         string
  bio:          string | null
  profileImage: string | null
  course:       string | null
  year:         number | null
  location:     string | null
  role:         string
  githubUrl:    string | null
  linkedinUrl:  string | null
  createdAt:    string

  skills: Array<{
    id:               string
    name:             string
    category:         string
    endorsementCount: number
  }>

  stats: {
    projectCount:     number
    certCount:        number
    totalPoints:      number
    currentLevel:     string  // 'Beginner' | 'Explorer' | 'Innovator' | 'Expert' | 'Master'
  }
}
```

**Errors:**
- `404` — Profile not found or user inactive

---

#### `PUT /api/v1/profiles/:id`

**Description:** Update own profile  
**Auth Required:** Yes (must be profile owner OR admin)

**Request Body** (all optional):
```typescript
{
  name?:        string   // min 2, max 100
  bio?:         string   // max 500
  course?:      string
  year?:        1 | 2 | 3 | 4
  location?:    string
  githubUrl?:   string   // must start with github.com
  linkedinUrl?: string   // must start with linkedin.com
}
```

**Response `200`:** Updated profile object (same shape as GET)

**Errors:**
- `400` — Validation failed
- `403` — Not profile owner
- `404` — Profile not found

---

#### `POST /api/v1/profiles/:id/avatar`

**Description:** Upload profile image  
**Auth Required:** Yes (must be profile owner)  
**Content-Type:** `multipart/form-data`

**Request Body:**
```
file: File  // max 5MB, JPEG/PNG/WebP only
```

**Response `200`:**
```typescript
{ profileImage: string }  // URL of uploaded image
```

**Errors:**
- `400` — File too large, unsupported format
- `403` — Not profile owner

---

#### `GET /api/v1/profiles/:id/skills`

**Description:** Get all skills for a student  
**Auth Required:** No (public)

**Response `200`:**
```typescript
Array<{
  id:               string
  name:             string
  category:         string
  endorsementCount: number
  addedAt:          string
}>
```

---

#### `POST /api/v1/profiles/:id/skills`

**Description:** Add a skill to own profile  
**Auth Required:** Yes (must be profile owner)

**Request Body:**
```typescript
{
  skillId?: string   // existing skill ID
  skillName?: string // auto-create if not found (max 50 chars)
}
// one of skillId OR skillName required
```

**Response `201`:**
```typescript
{
  id:               string
  name:             string
  category:         string
  endorsementCount: number
}
```

**Errors:**
- `400` — Neither skillId nor skillName provided
- `409` — Skill already on profile

---

#### `DELETE /api/v1/profiles/:id/skills/:skillId`

**Description:** Remove a skill from own profile  
**Auth Required:** Yes (must be profile owner)

**Response `200`:**
```typescript
{ success: true }
```

---

## App Router Pages & Components

### Pages

```
app/
├── (auth)/
│   ├── layout.tsx          ← Centered card layout, no sidebar
│   ├── login/
│   │   └── page.tsx        ← Login form
│   └── register/
│       └── page.tsx        ← Registration form (step 1 of onboarding)
│
├── (dashboard)/
│   ├── layout.tsx          ← Protected layout, sidebar + header
│   ├── onboarding/
│   │   └── page.tsx        ← Post-register profile setup (step 2)
│   └── profile/
│       ├── [id]/
│       │   └── page.tsx    ← Public profile view (Server Component)
│       └── edit/
│           └── page.tsx    ← Edit own profile (Client Component)
│
└── middleware.ts            ← JWT verification + RBAC
```

### Component Breakdown

#### Auth Components

**`components/auth/LoginForm.tsx`** — Client Component
```
Fields:    Email, Password
Actions:   Submit → POST /api/v1/auth/login
           "Forgot password?" link (Phase 2)
           "Don't have an account? Register" link
On success: Store accessToken → redirect to /dashboard
On error:   Show inline field error (Zod) or toast (401/500)
```

**`components/auth/RegisterForm.tsx`** — Client Component
```
Fields:    Name, Email, Password, Role (Student / Lecturer)
Actions:   Submit → POST /api/v1/auth/register
           "Already have an account? Login" link
On success: Store accessToken → redirect to /onboarding
On error:   Show inline errors
```

---

#### Profile Components

**`components/profile/ProfileHeader.tsx`** — Server Component
```
Shows:     Avatar, Name, Role badge, Course + Year
           Location, Bio
           GitHub link, LinkedIn link
           Edit button (if viewing own profile)
           Share button (copy URL)
```

**`components/profile/SkillsSection.tsx`** — Client Component
```
Shows:     Skills grouped by category
           Endorsement count per skill
           "Add skill" button (own profile only)
           "Remove skill" button on hover (own profile only)
Inputs:    Combobox search for existing skills
           Auto-create new skill if not found
TanStack:  useQuery(['profile', id, 'skills'])
           useMutation → POST /api/v1/profiles/:id/skills
```

**`components/profile/StatsBar.tsx`** — Server Component
```
Shows:     Total projects count
           Total certifications count
           Total points (formatted)
           Current level (with level badge color)
Data:      Fetched as part of GET /api/v1/profiles/:id?include=stats
```

**`components/profile/ProfileEditForm.tsx`** — Client Component
```
Fields:    Name, Bio (textarea, 500 char limit + counter)
           Course (select), Year (select 1-4)
           Location (text)
           GitHub URL, LinkedIn URL
Actions:   Save → PUT /api/v1/profiles/:id
           Cancel → navigate back
           Avatar upload → POST /api/v1/profiles/:id/avatar
           Image preview before upload
On success: Invalidate ['profile', id] query → show toast
```

**`components/profile/AvatarUpload.tsx`** — Client Component
```
Shows:     Current avatar (or initials placeholder if none)
           Upload button on hover
Accepts:   JPEG, PNG, WebP — max 5MB
Validates: File type + size client-side before upload
Preview:   Show preview before confirming upload
```

---

#### Onboarding Component

**`components/onboarding/OnboardingForm.tsx`** — Client Component
```
Step 1: Name, Bio, Course, Year, Location
Step 2: GitHub URL, LinkedIn URL
Step 3: Pick initial skills (multi-select from skill list, min 1)
Step 4: Avatar upload (optional, skippable)

On complete: PATCH isOnboarded = true → redirect to /dashboard
Skip option: Available on steps 2, 3, 4
Progress:    Visual step indicator (ShadCN Progress)
```

---

### Middleware

**`middleware.ts`**
```typescript
// Runs on every request to (dashboard) and admin routes
// Logic:
// 1. Read Authorization header or __hive_access cookie
// 2. Verify JWT signature
// 3. Check expiry — if expired, attempt silent refresh
// 4. Attach userId and role to request headers
// 5. Check role against route:
//    - /admin/*      → role must be 'admin'
//    - /lecturer/*   → role must be 'lecturer' or 'admin'
//    - /dashboard/*  → any authenticated user
// 6. If unauthenticated → redirect to /login

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/v1/profiles/:path*/edit',
    '/api/v1/auth/logout',
  ],
};
```

---

## TanStack Query Hooks

### `hooks/useAuth.ts`

```typescript
// Current user from auth context
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn:  () => fetch('/api/v1/auth/me').then(r => r.json()),
    staleTime: 1000 * 60 * 10,   // 10 minutes
    retry:     false,             // Don't retry auth failures
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      fetch('/api/v1/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(credentials),
      }).then(r => r.json()),
    onSuccess: (data) => {
      // Store access token in memory
      setAccessToken(data.accessToken);
      // Seed user into cache immediately
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetch('/api/v1/auth/logout', { method: 'POST' }).then(r => r.json()),
    onSuccess: () => {
      clearAccessToken();
      queryClient.clear();  // Wipe all cached data on logout
    },
  });
}
```

### `hooks/useProfile.ts`

```typescript
// Fetch public profile
export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn:  () =>
      fetch(`/api/v1/profiles/${userId}?include=skills,stats`)
        .then(r => r.json()),
    enabled:   !!userId,
    staleTime: 1000 * 60 * 5,  // 5 minutes
  });
}

// Update profile
export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileUpdateInput) =>
      fetch(`/api/v1/profiles/${userId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', userId], updatedProfile);
    },
  });
}

// Add skill to profile
export function useAddSkill(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { skillId?: string; skillName?: string }) =>
      fetch(`/api/v1/profiles/${userId}/skills`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}

// Remove skill from profile
export function useRemoveSkill(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (skillId: string) =>
      fetch(`/api/v1/profiles/${userId}/skills/${skillId}`, {
        method: 'DELETE',
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
```

---

## Validation Schemas (Zod)

```typescript
// lib/validators/authValidator.ts

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Please enter a valid email address'),
  password: z.string()
              .min(8, 'Password must be at least 8 characters')
              .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
              .regex(/[0-9]/, 'Password must contain at least one number'),
  role:     z.enum(['student', 'lecturer']),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

// lib/validators/profileValidator.ts

export const updateProfileSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  bio:         z.string().max(500).optional(),
  course:      z.string().max(100).optional(),
  year:        z.number().int().min(1).max(4).optional(),
  location:    z.string().max(100).optional(),
  githubUrl:   z.string().url().includes('github.com').optional().or(z.literal('')),
  linkedinUrl: z.string().url().includes('linkedin.com').optional().or(z.literal('')),
});

export const addSkillSchema = z.object({
  skillId:   z.string().cuid2().optional(),
  skillName: z.string().min(1).max(50).optional(),
}).refine(
  (data) => data.skillId || data.skillName,
  { message: 'Either skillId or skillName must be provided' }
);
```

---

## File & Folder Checklist

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                         [ ] Create
│   │   ├── login/page.tsx                     [ ] Create
│   │   └── register/page.tsx                  [ ] Create
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                         [ ] Create
│   │   ├── onboarding/page.tsx                [ ] Create
│   │   └── profile/
│   │       ├── [id]/page.tsx                  [ ] Create
│   │       └── edit/page.tsx                  [ ] Create
│   │
│   └── api/v1/
│       └── auth/
│           ├── register/route.ts              [ ] Create
│           ├── login/route.ts                 [ ] Create
│           ├── logout/route.ts                [ ] Create
│           ├── refresh/route.ts               [ ] Create
│           └── me/route.ts                    [ ] Create
│       └── profiles/
│           ├── [id]/route.ts                  [ ] Create
│           ├── [id]/avatar/route.ts           [ ] Create
│           └── [id]/skills/
│               ├── route.ts                   [ ] Create
│               └── [skillId]/route.ts         [ ] Create
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx                      [ ] Create
│   │   └── RegisterForm.tsx                   [ ] Create
│   ├── profile/
│   │   ├── ProfileHeader.tsx                  [ ] Create
│   │   ├── SkillsSection.tsx                  [ ] Create
│   │   ├── StatsBar.tsx                       [ ] Create
│   │   ├── ProfileEditForm.tsx                [ ] Create
│   │   └── AvatarUpload.tsx                   [ ] Create
│   └── onboarding/
│       └── OnboardingForm.tsx                 [ ] Create
│
├── hooks/
│   ├── useAuth.ts                             [ ] Create
│   └── useProfile.ts                          [ ] Create
│
├── lib/
│   ├── db/
│   │   ├── client.ts                          [ ] Create
│   │   └── schema.ts                          [ ] Create (users, sessions, skills, userSkills)
│   ├── services/
│   │   ├── authService.ts                     [ ] Create
│   │   └── profileService.ts                  [ ] Create
│   ├── validators/
│   │   ├── authValidator.ts                   [ ] Create
│   │   └── profileValidator.ts                [ ] Create
│   └── utils/
│       ├── jwt.ts                             [ ] Create
│       ├── password.ts                        [ ] Create
│       └── token.ts                           [ ] Create (access token memory store)
│
├── providers/
│   ├── QueryProvider.tsx                      [ ] Create
│   └── AuthProvider.tsx                       [ ] Create
│
├── types/
│   ├── auth.ts                                [ ] Create
│   └── profile.ts                             [ ] Create
│
├── proxy.ts                                  [ ] Create
└── env.ts                                    [ ] Create
│
drizzle/
├── migrations/                                [ ] Run after schema
└── seeds/
    └── skills.ts                              [ ] Create
```

---

## Environment Variables

```bash
# .env.local

# Database
DATABASE_URL="postgresql://user:pass@ep-xxxxx.neon.tech/hive_db?sslmode=require"

# JWT
JWT_SECRET="generate-with: openssl rand -base64 64"
JWT_ACCESS_EXPIRY="24h"
JWT_REFRESH_EXPIRY="7d"

# App
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"

# File Storage (Phase 2 - needed for avatar upload)
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;..."
AZURE_STORAGE_CONTAINER="hive-media"
```

---

## Security Checklist

- [ ] Passwords hashed with `bcrypt` (10 rounds) — never stored plain
- [ ] JWT signed with `HS256`, secret minimum 64 bytes
- [ ] Refresh token stored in `httpOnly`, `Secure`, `SameSite=Strict` cookie
- [ ] Access token kept in memory only (not localStorage)
- [ ] Rate limiting on `/register` and `/login` endpoints
- [ ] Email comparison is case-insensitive (`toLowerCase()` on write + query)
- [ ] SQL injection prevented by Drizzle parameterized queries
- [ ] Profile owner check before any PUT/DELETE
- [ ] Admin role not self-registerable (must be assigned by another admin)
- [ ] Deactivated users (`isActive = false`) return `403` on login
- [ ] File upload: type + size validated server-side (not just client)
- [ ] GitHub/LinkedIn URLs validated to correct domain before save

---

## Acceptance Criteria

Feature is complete when:

- [ ] A student can register, receive a JWT, and access the dashboard
- [ ] A lecturer can register with the lecturer role
- [ ] Admin accounts are seeded and not self-registerable
- [ ] Login returns 401 for wrong credentials without specifying which field is wrong
- [ ] Refresh token silently renews access without user re-logging in
- [ ] Logout clears the cookie and invalidates the session in the database
- [ ] Public profile page (`/profile/[id]`) renders for unauthenticated users
- [ ] Students can edit only their own profile
- [ ] Students can add and remove skills from their profile
- [ ] Onboarding flow completes and sets `isOnboarded = true`
- [ ] Profile image uploads and displays correctly
- [ ] All API routes return consistent error shapes
- [ ] All inputs are validated with Zod server-side
- [ ] TypeScript compiles with no errors (`tsc --noEmit`)
- [ ] No N+1 queries (verified with Drizzle query logging)

---

## Dependencies to Install

```bash
# Core
npm install drizzle-orm postgres @paralleldrive/cuid2

# Auth
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Validation
npm install zod

# File Upload (for avatar)
npm install @azure/storage-blob

# Dev
npm install -D drizzle-kit
```

---

## Notes for the Next Feature

Once this feature is merged and stable, Feature 02 (Project Upload & Showcase) can begin. It depends on:

- `users` table (author relationship)
- `userSkills` table (auto-tag skills from project technologies)
- JWT middleware (project creation is authenticated)
- Profile page (projects will appear as a section here)

---

**Feature Owner:** Full-Stack Developer  
**Reviewer:** Tech Lead  
**Estimated Effort:** 2 sprints (2 weeks)  
**Feature Branch:** `feature/01-auth-profiles`