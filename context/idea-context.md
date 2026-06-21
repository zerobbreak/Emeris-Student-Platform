# HIVE Showcase Platform
## Project Specification & Implementation Guide

**Platform**: Neon + Next.js + ShadCN + TanStack Query + Drizzle  
**Status**: MVP Planning  
**Version**: 1.0  
**Last Updated**: June 2026

---

## Table of Contents

1. [Vision & Core Idea](#vision--core-idea)
2. [Platform Overview](#platform-overview)
3. [Key Features Breakdown](#key-features-breakdown)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [UI/Component Architecture](#uicomponent-architecture)
7. [Data Fetching Strategy](#data-fetching-strategy)
8. [Implementation Priorities](#implementation-priorities)
9. [AI Integration Points](#ai-integration-points)
10. [Success Metrics](#success-metrics)

---

## Vision & Core Idea

### The Problem We're Solving

Currently at EMERIS IT, student achievements, projects, and skills are scattered and invisible:
- No centralized place to showcase student work
- Industry partners can't discover talented students
- Students lack a professional portfolio platform built for their context
- Work built in The Hive stays invisible beyond immediate teams
- Recognition is inconsistent and informal

### The Solution: HIVE Showcase Platform

A web-based digital ecosystem that:

**For Students:**
- Personal portfolio pages to display skills, projects, certifications, and achievements
- Gamification system with badges, points, and levels to track progress
- Recognition wall for formal achievement acknowledgment
- Opportunity board to discover internships and real-world roles
- AI-powered skill gap analysis with career pathway recommendations

**For Lecturers & Mentors:**
- Ability to verify student skills and achievements
- Dashboard to award badges and endorse capabilities
- Search students by specific technical competency
- Content approval workflow for quality control

**For Administrators:**
- Full platform management and user oversight
- Content curation and feature decisions
- Report generation on cohort competencies
- Competition and opportunity management

**For Industry Partners & Employers:**
- Browse curated student portfolios by skill
- Discover Hive project innovations
- Post internship and graduate program opportunities
- Identify hiring candidates

### Three Core Questions the Platform Answers

1. **What are EMERIS IT students capable of?** → Student Portfolio Showcase
2. **What is being built in The Hive right now?** → Hive Projects Gallery
3. **How are students contributing to real-world solutions?** → Achievement Wall + Opportunity Board

---

## Platform Overview

### Core Modules

The platform consists of eight interconnected modules:

| Module | Purpose | Primary Users |
|--------|---------|---------------|
| **Student Portfolios** | Personal profile pages with skills, projects, achievements | Students, Lecturers, Industry Partners |
| **Hive Projects Gallery** | Curated showcase of Hive-developed projects | All users |
| **Skills Board** | Searchable directory mapping students to competencies | Lecturers, Industry Partners |
| **Achievement Wall** | Recognition display for awards and milestones | All users |
| **Gamification Engine** | Points, badges, levels, and leaderboards | Students (primary) |
| **Opportunity Board** | Internships, competitions, hackathons, graduate roles | Students (primary) |
| **AI Skill Analyser** | Profile-driven skill gap and career pathway analysis | Students (primary) |
| **Homepage Dashboard** | Curated landing page featuring projects and achievements | All users |

### User Roles & Capabilities

#### Student
- Create and manage personal profile
- Upload and showcase projects
- Submit certifications
- View points, badges, and achievements
- Browse and apply for opportunities
- Receive AI-powered skill recommendations
- Track leaderboard position

#### Lecturer / Mentor
- Verify and endorse student skills
- Award achievement badges
- Approve content submissions
- Recommend students for opportunities
- View cohort competency reports
- Create competitions

#### Administrator
- Manage all users and permissions
- Approve/feature content
- Create and manage opportunities
- Generate platform reports
- Manage gamification settings
- Configure AI recommendations

#### Industry Partner (Read-Only)
- Browse student portfolios
- Search by skill
- View Hive Projects Gallery
- Post opportunities (future version)

---

## Key Features Breakdown

### 1. Student Portfolio

**What It Is:**  
A personal profile page that serves as a student's professional showcase.

**Core Fields:**

| Field | Type | Description |
|-------|------|-------------|
| Name | Text | Full name (display priority) |
| Course | Select | Program of study |
| Year | Select | Current year (1-4) |
| Bio | Textarea | Personal introduction (max 500 chars) |
| Profile Image | Image | Avatar/headshot (max 5MB) |
| Skills | Tags | Technical & soft skills (max 15) |
| Contact Email | Email | For employer inquiries |
| GitHub URL | URL | Code portfolio link |
| LinkedIn URL | URL | Professional profile link |
| Location | Text | City/Province (optional) |

**Related Data:**
- Projects (linked via ProjectMember)
- Certifications (linked via UserCertification)
- Achievements (linked via UserAchievement)
- Endorsements (received from lecturers)
- Badges (earned through gamification)

**Key Features:**
- Public view URL (shareable profile link)
- Auto-populated skill tags from projects
- Achievement count display
- "Endorsed by" section showing lecturer endorsements
- Activity timeline
- Stats dashboard (total projects, certifications, points)

**Database Tables (Drizzle):**

```typescript
// Core user profile
users {
  id: string (PK, CUID2)
  email: string (unique)
  name: string
  bio: string
  profileImage: string (image URL)
  course: string (e.g., "CS101", "DA201")
  year: integer (1-4)
  location: string
  githubUrl: string
  linkedinUrl: string
  role: enum (student | lecturer | admin)
  createdAt: timestamp
  updatedAt: timestamp
}

// User skills (many-to-many)
userSkills {
  id: string (PK)
  userId: string (FK → users)
  skillId: string (FK → skills)
  endorsementCount: integer (default 0)
}

skills {
  id: string (PK)
  name: string (unique, e.g., "React", "Python")
  category: string (backend | frontend | cloud | data-science | etc)
  description: string
}
```

---

### 2. Hive Projects Gallery

**What It Is:**  
A curated showcase of projects developed inside The Hive, serving as proof of student capability and innovation.

**Core Fields:**

| Field | Type | Description |
|-------|------|-------------|
| Project Name | Text | Title of project |
| Description | Textarea | What the project does (max 1000 chars) |
| Problem Statement | Textarea | Real-world challenge addressed |
| Technologies Used | Tags | Languages, frameworks, platforms |
| Team Members | Members List | Student profiles + roles |
| Status | Enum | Idea / Planning / Dev / Testing / Complete |
| Impact Category | Select | Education / Healthcare / Community / Finance / Ag / Environment |
| Screenshots | Images | Visual previews (up to 5) |
| Demo Video | URL | YouTube/Vimeo walkthrough link |
| GitHub Repo | URL | Source code repository |
| Live Demo | URL | Deployed application URL (if applicable) |
| Featured | Boolean | Homepage feature flag |

**Key Features:**
- Filterable by status, technology, impact category
- Sortable by date, popularity, team size
- Team member roles (Developer, Designer, Researcher, Lead, Tester)
- Comments and discussion thread
- View counter and popularity score
- Social sharing buttons

**Database Tables (Drizzle):**

```typescript
hiveProjects {
  id: string (PK)
  title: string
  description: string
  problemStatement: string
  status: enum (idea | planning | development | testing | completed)
  impactCategory: string
  thumbnailImage: string
  demoVideoUrl: string
  githubUrl: string
  liveUrl: string
  featured: boolean (default false)
  viewCount: integer (default 0)
  createdAt: timestamp
  updatedAt: timestamp
}

hiveProjectTechnologies {
  id: string (PK)
  projectId: string (FK → hiveProjects)
  technology: string (e.g., "React", "Python")
}

hiveProjectMembers {
  id: string (PK)
  projectId: string (FK → hiveProjects)
  userId: string (FK → users)
  role: enum (developer | designer | researcher | lead | tester)
  joinedAt: timestamp
}

hiveProjectImages {
  id: string (PK)
  projectId: string (FK → hiveProjects)
  imageUrl: string
  caption: string
  displayOrder: integer
}
```

---

### 3. Skills Board

**What It Is:**  
A searchable, filterable directory that maps students to their technical competencies. Lecturers and industry partners use this to discover students with specific skills.

**Key Features:**
- Search by skill name (autocomplete)
- Filter by skill category (Backend, Frontend, Cloud, Data Science, etc.)
- View student list for each skill
- Sort by endorsement count (credibility indicator)
- Skill expertise levels (Learning / Competent / Expert)
- View student profiles directly from skill card

**Search & Filter Patterns:**
- Skill search with autocomplete: `/api/skills?search=python`
- Filter by category: `/api/skills?category=backend`
- Get students for skill: `/api/skills/{skillId}/students`

**Database Tables (Drizzle):**

```typescript
// Skills data already defined in Portfolio section
// Key index for performance:
CREATE INDEX idx_userSkills_skillId ON userSkills(skillId);
CREATE INDEX idx_userSkills_endorsementCount ON userSkills(endorsementCount);
```

**TanStack Query Strategy:**
- Cache skill list with 5-minute stale time
- Invalidate when endorsement added
- Lazy-load student list when skill card expanded

---

### 4. Achievement Wall & Hall of Fame

**What It Is:**  
A public recognition system that highlights student achievements and awards. Serves as motivation and formal acknowledgment of excellence.

**Achievement Types:**

| Award | Criteria | Awarded By |
|-------|----------|-----------|
| Student of the Month | Outstanding overall contribution | Lecturer |
| Best Project Award | Exceptional project quality | Lecturer |
| Most Improved Student | Significant growth trajectory | Lecturer |
| Innovation Award | Novel/creative solution | Lecturer |
| Community Impact Award | Real-world positive outcome | Admin |
| Hall of Fame | Competition winner / Industry deployment | Admin |

**Features:**
- Timeline view of recent achievements
- Filter by type and student
- Search by student name
- Public achievement cards with badge graphics
- Achievement points contribution to gamification
- Celebration message/context for each award

**Database Tables (Drizzle):**

```typescript
achievements {
  id: string (PK)
  title: string (enum type name)
  description: string
  pointsValue: integer (varies by type)
  badgeIcon: string (icon URL or SVG name)
  awardedAt: timestamp
  awardedBy: string (FK → users, lecturer/admin)
}

userAchievements {
  id: string (PK)
  userId: string (FK → users)
  achievementId: string (FK → achievements)
  context: string (e.g., project name, specific accomplishment)
  awardedAt: timestamp
}

// For Hall of Fame (high-prestige achievements)
hallOfFameEntries {
  id: string (PK)
  studentId: string (FK → users)
  projectId: string (FK → hiveProjects, optional)
  title: string
  description: string
  context: string (e.g., "Deployed to production", "Won competition")
  achievedAt: timestamp
  displayOrder: integer
}
```

---

### 5. Gamification Engine

**What It Is:**  
A points and badges system that incentivizes student engagement and tracks progress through visible levels.

**Points Structure:**

| Activity | Points | Frequency |
|----------|--------|-----------|
| Upload project | 50 | Once per project |
| Submit certification | 30 | Once per cert |
| Receive endorsement | 25 | Per endorsement |
| Enter competition | 20 | Per entry |
| Log community service | 15 | Per service |
| Complete Hive milestone | 40 | Varies |
| Achieve first 100 points | 50 | Bonus (once) |

**Level System:**

| Level | Points Required | Badge Color |
|-------|-----------------|-------------|
| Beginner | 0-100 | Gray |
| Explorer | 100-300 | Blue |
| Innovator | 300-600 | Green |
| Expert | 600-1000 | Gold |
| Master | 1000+ | Platinum |

**Features:**
- Real-time point tracking in user dashboard
- Level progression with visual indicators
- Badge display on profile
- Level-up notification/celebration
- Point history/activity log
- Leaderboard visibility

**Database Tables (Drizzle):**

```typescript
userPoints {
  id: string (PK)
  userId: string (FK → users)
  totalPoints: integer (default 0)
  currentLevel: integer (1-5, corresponds to levels above)
  updatedAt: timestamp
}

pointsTransaction {
  id: string (PK)
  userId: string (FK → users)
  pointsEarned: integer
  activityType: enum (project | cert | endorsement | competition | service | milestone)
  contextId: string (project ID, cert ID, etc)
  earnedAt: timestamp
}

badges {
  id: string (PK)
  name: string
  description: string
  icon: string (SVG/URL)
  requirement: string (JSON config for achievement)
  displayOrder: integer
}

userBadges {
  id: string (PK)
  userId: string (FK → users)
  badgeId: string (FK → badges)
  unlockedAt: timestamp
}
```

**Implementation Notes:**
- Use transaction triggers to award points immediately on action completion
- Batch points calculation for leaderboard (once daily)
- Cache user level/points with 1-minute stale time (refresh on action)

---

### 6. Leaderboards

**What It Is:**  
Live rankings that drive friendly competition and showcase top performers across multiple dimensions.

**Leaderboard Types:**

| Leaderboard | Sort By | Reset | Audience |
|-------------|---------|-------|----------|
| Most Active Students | Total points | Monthly | All |
| Most Skilled Students | Unique endorsed skills | Rolling | All |
| Most Projects Completed | Project count | None | All |
| Most Certifications | Certification count | None | All |

**Features:**
- Real-time ranking display
- Student name, avatar, score, badge
- Time-based filtering (This Month / This Semester / All Time)
- Personal ranking indicator ("You are #47")
- Top 10 / Top 25 views
- Embeddable leaderboard widget

**Database Tables (Drizzle):**

```typescript
// Leaderboard data calculated from aggregates
// No separate table needed - calculated on query using views

// SQL view example:
-- CREATE VIEW leaderboard_most_active AS
-- SELECT 
--   u.id, u.name, u.profileImage,
--   up.totalPoints,
--   ROW_NUMBER() OVER (ORDER BY up.totalPoints DESC) as rank
-- FROM users u
-- JOIN userPoints up ON u.id = up.userId
-- WHERE u.role = 'student'
-- ORDER BY up.totalPoints DESC;
```

**TanStack Query Strategy:**
- Cache leaderboard data with 15-minute stale time (limit API calls)
- Separate cache keys for each leaderboard type
- Invalidate when points transaction occurs
- Client-side ranking calculation for personal position

---

### 7. Opportunity Board

**What It Is:**  
A job board showcasing internships, graduate programs, hackathons, and competitions. Students can apply directly and track application status.

**Opportunity Types:**
- Internship (3-6 month role)
- Graduate Program (entry-level post-graduation)
- Part-Time Role (ongoing, flexible)
- Hackathon (event-based competition)
- Competition (skill-based challenge)
- Workshop / Training

**Core Fields:**

| Field | Type | Description |
|-------|------|-------------|
| Title | Text | Role/opportunity name |
| Organization | Text | Company or event name |
| Type | Enum | Internship / Graduate / Part-Time / Hackathon / Competition / Workshop |
| Description | Textarea | Full opportunity details |
| Requirements | Tags | Required skills/qualifications |
| Deadline | Date | Application closing date |
| Link | URL | External application URL (or internal apply button) |
| Featured | Boolean | Homepage feature flag |
| Status | Enum | Open / Closing Soon / Closed |

**Key Features:**
- Search and filter opportunities
- Apply directly (internal form or external redirect)
- Save opportunities (wishlist)
- Application status tracking (Applied / Pending / Accepted / Rejected)
- Email notifications for relevant opportunities (skill-based matching)
- Organization profile/branding

**Database Tables (Drizzle):**

```typescript
opportunities {
  id: string (PK)
  title: string
  organization: string
  type: enum (internship | graduate | part_time | hackathon | competition | workshop)
  description: string
  requirements: string[] (array of skill names)
  deadline: timestamp
  externalUrl: string (optional, for external applications)
  featured: boolean
  status: enum (open | closing_soon | closed)
  createdAt: timestamp
  updatedAt: timestamp
}

userApplications {
  id: string (PK)
  userId: string (FK → users)
  opportunityId: string (FK → opportunities)
  status: enum (applied | pending | accepted | rejected)
  appliedAt: timestamp
  statusUpdatedAt: timestamp
  internalResponse: string (for internal applications)
}

// For tracking which students applied (admin view)
applicationActivity {
  id: string (PK)
  opportunityId: string (FK → opportunities)
  applicationCount: integer
  viewCount: integer
  lastUpdated: timestamp
}
```

**AI Matching:**
- When opportunity posted, calculate match score for each student (skill overlap)
- Notify students with 70%+ match score
- Display "Skills Match: 85%" on opportunity card for matched students

---

### 8. AI-Powered Skill Analyser

**What It Is:**  
An intelligent recommendation engine that analyzes student profiles and provides personalized skill gap analysis and career pathway suggestions.

**Inputs (from student profile):**
- Current skills (with endorsement count as confidence score)
- Completed projects (technology stack)
- Certifications
- Level/experience
- Interests (if provided)

**Outputs:**
- **Suggested Next Skills** (3-5 recommendations ranked by relevance)
- **Career Pathway Matches** (e.g., "Backend Developer", "Data Engineer", "Full-Stack Developer")
- **Learning Resources** (optional, links to courses/tutorials)
- **Time to Master** (estimated weeks for each suggested skill)

**Example Analysis:**

```json
{
  "studentId": "user_123",
  "analysisDate": "2024-06-21",
  "currentSkills": [
    { "name": "Python", "level": "Expert", "projects": 5 },
    { "name": "SQL", "level": "Competent", "projects": 3 },
    { "name": "FastAPI", "level": "Competent", "projects": 2 }
  ],
  "suggestedSkills": [
    { "name": "Docker", "relevance": 95, "careerValue": "High", "timeToMaster": "3 weeks" },
    { "name": "PostgreSQL", "relevance": 88, "careerValue": "High", "timeToMaster": "4 weeks" },
    { "name": "Redis", "relevance": 72, "careerValue": "Medium", "timeToMaster": "2 weeks" }
  ],
  "careerPathways": [
    { "title": "Backend Developer", "match": 92, "avgSalary": "R45k-R65k" },
    { "title": "Data Engineer", "match": 78, "avgSalary": "R50k-R70k" },
    { "title": "Full-Stack Developer", "match": 65, "avgSalary": "R40k-R60k" }
  ]
}
```

**Integration:**
- OpenAI API or Azure Cognitive Services
- Run analysis on student profile view
- Cache result (re-run weekly or on profile update)
- Display on student dashboard with "Last Updated: X days ago"
- Refresh button for manual re-analysis

**Database Tables (Drizzle):**

```typescript
skillAnalysis {
  id: string (PK)
  userId: string (FK → users)
  suggestedSkills: JSON (array of suggestions)
  careerPathways: JSON (array of pathways)
  analysisScore: integer (overall recommendation confidence 0-100)
  generatedAt: timestamp
  expiresAt: timestamp (re-run after this date)
}
```

**TanStack Query Pattern:**
- Cache analysis result with 7-day stale time
- Invalidate on profile update or skill endorsement
- Show loading state while AI generates analysis
- Graceful degradation if API fails (show cached result)

---

### 9. Homepage Dashboard

**What It Is:**  
The landing page that introduces the platform and features curated content to drive engagement.

**Homepage Sections:**

1. **Hero Section**
   - Platform title: "HIVE Showcase"
   - Tagline: "Showcase Your Skills. Share Your Impact. Open Doors."
   - CTA buttons: "Create Profile" / "Explore Students"
   - Background: Hero image or gradient

2. **Featured Projects**
   - 3-4 highlighted Hive projects
   - Click to view full project page
   - Rotated weekly by admin

3. **Recent Achievements**
   - Latest awards/student of the month
   - Cards with student avatar, award type, date
   - Link to full Achievement Wall

4. **Quick Stats**
   - Total students on platform
   - Total projects showcased
   - Total endorsements
   - Active opportunities

5. **Top Performers**
   - Top 5 students by points
   - Leaderboard teaser link

6. **Opportunities Highlight**
   - 2-3 featured opportunities
   - "View all opportunities" link

7. **Footer**
   - Platform navigation
   - Social links
   - Contact/feedback
   - Privacy & policies

**Data Requirements:**
- All data served via API (see API Specifications section)
- Cache all homepage data with 1-hour stale time

---

## Database Schema

### Complete Entity Relationship Diagram (Conceptual)

```
users (id, email, name, role, course, year, bio, profileImage, ...)
├── userSkills (userId → skillId, endorsementCount)
├── userProjects (userId → projectId, role)
├── userCertifications (userId → certificationId)
├── userAchievements (userId → achievementId)
├── userBadges (userId → badgeId)
├── userPoints (userId, totalPoints, currentLevel)
└── userApplications (userId → opportunityId)

skills (id, name, category, description)
└── endorsements (lecturerId → studentId, skillId)

projects (id, title, userId, description, status, ...)
├── projectMembers (projectId → userId, role)
├── projectTechnologies (projectId → technology)
└── projectImages (projectId, imageUrl, caption)

certifications (id, title, issuer, dateObtained, ...)
└── userCertifications (userId → certificationsId)

hiveProjects (id, title, description, status, ...)
├── hiveProjectMembers (projectId → userId, role)
├── hiveProjectTechnologies (projectId → technology)
└── hiveProjectImages (projectId, imageUrl)

achievements (id, title, pointsValue, badgeIcon)
└── userAchievements (userId → achievementId)

opportunities (id, title, organization, type, requirements, deadline)
└── userApplications (userId → opportunityId, status)

pointsTransactions (userId, pointsEarned, activityType, contextId)

skillAnalysis (userId, suggestedSkills, careerPathways, generatedAt)
```

### Core Drizzle Schema File Structure

```typescript
// lib/db/schema.ts

// Users & Authentication
export const users = pgTable('users', { ... });
export const usersRelations = relations(users, { many });

// Skills & Endorsements
export const skills = pgTable('skills', { ... });
export const userSkills = pgTable('user_skills', { ... });
export const endorsements = pgTable('endorsements', { ... });

// Student Projects
export const projects = pgTable('projects', { ... });
export const projectMembers = pgTable('project_members', { ... });
export const projectTechnologies = pgTable('project_technologies', { ... });
export const projectImages = pgTable('project_images', { ... });

// Certifications
export const certifications = pgTable('certifications', { ... });
export const userCertifications = pgTable('user_certifications', { ... });

// Hive Projects
export const hiveProjects = pgTable('hive_projects', { ... });
export const hiveProjectMembers = pgTable('hive_project_members', { ... });
export const hiveProjectTechnologies = pgTable('hive_project_technologies', { ... });
export const hiveProjectImages = pgTable('hive_project_images', { ... });

// Achievements & Gamification
export const achievements = pgTable('achievements', { ... });
export const userAchievements = pgTable('user_achievements', { ... });
export const badges = pgTable('badges', { ... });
export const userBadges = pgTable('user_badges', { ... });
export const userPoints = pgTable('user_points', { ... });
export const pointsTransactions = pgTable('points_transactions', { ... });

// Opportunities
export const opportunities = pgTable('opportunities', { ... });
export const userApplications = pgTable('user_applications', { ... });

// AI Analysis
export const skillAnalysis = pgTable('skill_analysis', { ... });

// All relations
export const allRelations = { usersRelations, ... };
```

---

## API Specifications

### Authentication & Core Routes

All routes require JWT authentication (except public profile/browse endpoints).

**Base Path:** `/api/v1`

### Student Portfolio APIs

#### GET `/api/v1/profiles/{studentId}`
**Description:** Get student profile by ID  
**Query Params:**
- `include` (optional): comma-separated fields (projects, certifications, achievements, skills)

**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@emeris.ac.za",
  "profileImage": "https://...",
  "bio": "Passionate about backend development",
  "course": "CS101",
  "year": 3,
  "skills": [
    { "id": "skill_456", "name": "Python", "endorsementCount": 5 },
    { "id": "skill_789", "name": "React", "endorsementCount": 3 }
  ],
  "projects": [
    { "id": "proj_1", "title": "E-Commerce Platform", ... }
  ],
  "certifications": [...],
  "achievements": [...],
  "contactLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "stats": {
    "totalProjects": 5,
    "totalCertifications": 2,
    "totalPoints": 350,
    "currentLevel": "Innovator"
  }
}
```

#### PUT `/api/v1/profiles/{studentId}`
**Description:** Update own profile (students) or any profile (admin)  
**Body:**
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "profileImage": "base64_or_url",
  "course": "CS101",
  "year": 3,
  "contactLinks": { "github": "...", "linkedin": "..." }
}
```

#### POST `/api/v1/profiles/{studentId}/skills`
**Description:** Add skill to profile  
**Body:**
```json
{
  "skillId": "skill_456"  // or "skillName": "Python" (auto-create if needed)
}
```

### Projects APIs

#### GET `/api/v1/projects?studentId={id}&status={status}&page={page}&limit={limit}`
**Description:** List student projects with filtering  
**Response:**
```json
{
  "items": [
    {
      "id": "proj_1",
      "title": "E-Commerce Platform",
      "description": "Full-stack e-commerce solution",
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "teamMembers": [{ "id": "user_1", "name": "John", "role": "Lead" }],
      "status": "completed",
      "images": ["img1.jpg", "img2.jpg"],
      "demoUrl": "https://...",
      "githubUrl": "https://github.com/..."
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 10,
  "hasMore": false
}
```

#### POST `/api/v1/projects`
**Description:** Create new project  
**Body:**
```json
{
  "title": "Project Name",
  "description": "Description",
  "technologies": ["React", "Node.js"],
  "demoUrl": "https://...",
  "githubUrl": "https://...",
  "images": ["base64_image_1", "base64_image_2"]
}
```

### Hive Projects Gallery APIs

#### GET `/api/v1/hive-projects?status={status}&technology={tech}&featured={true}&page={page}&limit={limit}`
**Description:** List Hive projects with filters  
**Response:** Similar structure to projects above

#### GET `/api/v1/hive-projects/search?q={query}`
**Description:** Full-text search Hive projects

### Skills Board APIs

#### GET `/api/v1/skills?category={category}&search={query}`
**Description:** List skills with filtering  
**Response:**
```json
{
  "items": [
    {
      "id": "skill_456",
      "name": "Python",
      "category": "backend",
      "endorsementCount": 45,
      "studentCount": 23,
      "students": [
        { "id": "user_1", "name": "John Doe", "endorsementCount": 5 }
      ]
    }
  ]
}
```

#### GET `/api/v1/skills/{skillId}/students?limit={limit}`
**Description:** Get students with specific skill  
**Response:** Array of student profiles with endorsement counts

#### POST `/api/v1/endorsements`
**Description:** Lecturer endorses student skill  
**Body:**
```json
{
  "studentId": "user_123",
  "skillId": "skill_456",
  "comment": "Excellent Python developer"
}
```

### Achievements & Gamification APIs

#### GET `/api/v1/achievements?type={type}&studentId={id}&page={page}`
**Description:** List achievements  
**Response:**
```json
{
  "items": [
    {
      "id": "ach_1",
      "title": "Student of the Month",
      "awardedTo": { "id": "user_1", "name": "John Doe", "profileImage": "..." },
      "awardedAt": "2024-06-21",
      "awardedBy": { "id": "lecturer_1", "name": "Prof. Smith" },
      "pointsValue": 50,
      "badgeIcon": "url_or_svg"
    }
  ]
}
```

#### GET `/api/v1/leaderboards/{type}?timeframe={timeframe}`
**Description:** Get leaderboard data  
**Types:** most_active | most_skilled | most_projects | most_certifications  
**Timeframes:** this_month | this_semester | all_time  
**Response:**
```json
{
  "items": [
    {
      "rank": 1,
      "studentId": "user_1",
      "name": "Jane Smith",
      "profileImage": "...",
      "value": 1250,  // points/skill count/etc
      "isCurrentUser": false
    }
  ],
  "currentUserRank": 47,
  "currentUserValue": 450
}
```

#### GET `/api/v1/users/{userId}/points`
**Description:** Get user points and level  
**Response:**
```json
{
  "userId": "user_123",
  "totalPoints": 450,
  "currentLevel": 3,
  "levelName": "Innovator",
  "nextLevelPoints": 600,
  "pointsToNextLevel": 150,
  "levelPercentage": 75
}
```

### Opportunities APIs

#### GET `/api/v1/opportunities?type={type}&status={status}&search={query}&page={page}`
**Description:** List opportunities with filtering  
**Response:**
```json
{
  "items": [
    {
      "id": "opp_1",
      "title": "Backend Developer Internship",
      "organization": "Tech Company",
      "type": "internship",
      "description": "...",
      "requirements": ["Python", "Django"],
      "deadline": "2024-07-31",
      "featured": true,
      "status": "open",
      "externalUrl": "https://...",
      "skillMatch": 85  // if user logged in
    }
  ]
}
```

#### POST `/api/v1/opportunities/{opportunityId}/apply`
**Description:** Apply for opportunity  
**Body:**
```json
{
  "applicationMessage": "I'm interested in this opportunity because..."
}
```

### AI Analysis APIs

#### GET `/api/v1/skill-analysis/{studentId}`
**Description:** Get AI skill analysis for student  
**Response:**
```json
{
  "studentId": "user_123",
  "currentSkills": [
    { "name": "Python", "level": "Expert", "projects": 5 }
  ],
  "suggestedSkills": [
    { "name": "Docker", "relevance": 95, "timeToMaster": "3 weeks" }
  ],
  "careerPathways": [
    { "title": "Backend Developer", "match": 92 }
  ],
  "analysisConfidence": 88,
  "generatedAt": "2024-06-21",
  "expiresAt": "2024-06-28"
}
```

#### POST `/api/v1/skill-analysis/{studentId}/refresh`
**Description:** Manually trigger AI re-analysis  
**Response:** Same as GET above

---

## UI/Component Architecture

### Page Structure (App Router)

```
app/
├── layout.tsx (Root layout with providers)
├── page.tsx (Homepage/Dashboard)
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (dashboard)/
│   ├── layout.tsx (Protected layout with sidebar)
│   ├── page.tsx (Student dashboard)
│   ├── profile/
│   │   ├── [id]/page.tsx (View profile)
│   │   ├── edit/page.tsx (Edit own profile)
│   │   └── [id]/share.tsx (Share profile)
│   ├── projects/
│   │   ├── page.tsx (My projects)
│   │   ├── create/page.tsx (Upload project)
│   │   ├── [id]/page.tsx (View project)
│   │   └── [id]/edit/page.tsx (Edit project)
│   ├── hive-projects/
│   │   ├── page.tsx (Gallery view)
│   │   └── [id]/page.tsx (Project detail)
│   ├── skills/
│   │   ├── page.tsx (Skills board/search)
│   │   └── [id]/page.tsx (Skill detail with students)
│   ├── achievements/
│   │   ├── page.tsx (Achievement wall)
│   │   └── hall-of-fame/page.tsx
│   ├── leaderboards/page.tsx
│   ├── opportunities/
│   │   ├── page.tsx (Browse opportunities)
│   │   ├── [id]/page.tsx (Opportunity detail)
│   │   └── my-applications/page.tsx
│   └── analysis/page.tsx (AI skill analysis)
├── admin/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── users/page.tsx
│   ├── content/[type]/page.tsx (Moderate content)
│   ├── opportunities/page.tsx (Manage opportunities)
│   ├── gamification/page.tsx (Points/badges config)
│   └── reports/page.tsx
└── api/
    └── v1/
        ├── profiles/route.ts
        ├── projects/route.ts
        ├── hive-projects/route.ts
        ├── skills/route.ts
        ├── achievements/route.ts
        ├── leaderboards/route.ts
        ├── opportunities/route.ts
        ├── skill-analysis/route.ts
        └── ...
```

### Component Architecture

#### Core Layout Components

```typescript
components/
├── layouts/
│   ├── RootLayout.tsx (Providers, header, footer)
│   ├── DashboardLayout.tsx (Sidebar + main content)
│   └── AdminLayout.tsx (Admin-specific navigation)
├── navigation/
│   ├── Header.tsx (Top navigation)
│   ├── Sidebar.tsx (Left navigation for dashboard)
│   └── Breadcrumb.tsx
├── shared/
│   ├── LoadingSpinner.tsx
│   ├── ErrorAlert.tsx
│   ├── EmptyState.tsx
│   └── Pagination.tsx
```

#### Feature Components

```typescript
components/
├── profiles/
│   ├── ProfileCard.tsx (User profile display)
│   ├── ProfileEditor.tsx (Edit form)
│   ├── SkillsList.tsx (Skills section)
│   ├── ProjectsList.tsx (Projects section)
│   └── StatsWidget.tsx (Points/level display)
├── projects/
│   ├── ProjectCard.tsx (Project preview card)
│   ├── ProjectDetail.tsx (Full project view)
│   ├── ProjectForm.tsx (Create/edit form)
│   ├── ProjectImages.tsx (Image gallery)
│   └── TeamDisplay.tsx (Team members list)
├── hive-projects/
│   ├── HiveProjectGallery.tsx (Grid/list view)
│   ├── HiveProjectCard.tsx (Preview card)
│   └── HiveProjectFilters.tsx (Filter sidebar)
├── skills/
│   ├── SkillsBoard.tsx (Search + list)
│   ├── SkillCard.tsx (Skill with student count)
│   ├── SkillSearch.tsx (Autocomplete search)
│   └── StudentSkillsList.tsx (Students with skill)
├── achievements/
│   ├── AchievementWall.tsx (Timeline view)
│   ├── AchievementCard.tsx (Single achievement)
│   ├── AwardButton.tsx (Lecturer award button)
│   └── HallOfFame.tsx (Featured achievements)
├── gamification/
│   ├── PointsDisplay.tsx (Current points)
│   ├── LevelIndicator.tsx (Level badge + progress)
│   ├── BadgeCollection.tsx (All badges)
│   └── LeaderboardWidget.tsx (Top 10 preview)
├── opportunities/
│   ├── OpportunitiesList.tsx (Search + filter)
│   ├── OpportunityCard.tsx (Preview card)
│   ├── OpportunityDetail.tsx (Full details)
│   ├── ApplicationForm.tsx (Apply form)
│   └── SkillMatchBadge.tsx (Relevance indicator)
├── analysis/
│   ├── SkillAnalysisDashboard.tsx (Full results)
│   ├── SuggestedSkillsCard.tsx (Learning paths)
│   ├── CareerPathwayCard.tsx (Job recommendations)
│   └── RefreshAnalysisButton.tsx
└── forms/
    ├── ProfileForm.tsx (Edit profile)
    ├── ProjectForm.tsx (Create/edit project)
    ├── CertificationForm.tsx
    └── OpportunityApplicationForm.tsx
```

### ShadCN Components Used

- Button, Input, Textarea, Select, Checkbox
- Card, CardContent, CardHeader, CardFooter
- Dialog, AlertDialog
- Tabs, Accordion
- Badge, Avatar
- ProgressBar
- Table (for leaderboards)
- Toast (notifications)
- Tooltip
- Dropdown Menu
- Search (Combobox)
- Modal
- Skeleton (loading states)

---

## Data Fetching Strategy

### TanStack Query Setup

#### Query Keys Convention

```typescript
// Profiles
['profiles']
['profiles', studentId]
['profiles', studentId, 'skills']
['profiles', studentId, 'projects']

// Projects
['projects']
['projects', userId]
['projects', projectId]
['hive-projects']
['hive-projects', { status, technology, featured }]

// Skills
['skills']
['skills', { category, search }]
['skills', skillId, 'students']

// Achievements
['achievements']
['achievements', { type, studentId }]
['leaderboards', type, timeframe]

// Opportunities
['opportunities']
['opportunities', { type, status, search }]
['opportunities', opportunityId]

// Analysis
['skill-analysis', studentId]

// Current User
['auth', 'user']
```

#### Custom Hooks

```typescript
// hooks/useProfiles.ts
export function useStudentProfile(studentId: string) {
  return useQuery({
    queryKey: ['profiles', studentId],
    queryFn: () => fetch(`/api/v1/profiles/${studentId}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStudentProjects(studentId: string) {
  return useQuery({
    queryKey: ['projects', studentId],
    queryFn: () => fetch(`/api/v1/projects?studentId=${studentId}`).then(r => r.json()),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// hooks/useHiveProjects.ts
export function useHiveProjects(filters?: HiveProjectFilters) {
  return useQuery({
    queryKey: ['hive-projects', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.technology) params.append('technology', filters.technology);
      return fetch(`/api/v1/hive-projects?${params}`).then(r => r.json());
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for gallery
  });
}

// hooks/useLeaderboards.ts
export function useLeaderboard(type: string, timeframe: string = 'this_month') {
  return useQuery({
    queryKey: ['leaderboards', type, timeframe],
    queryFn: () => fetch(`/api/v1/leaderboards/${type}?timeframe=${timeframe}`).then(r => r.json()),
    staleTime: 15 * 60 * 1000, // Batch update once per 15 min
  });
}

// hooks/useSkillAnalysis.ts
export function useSkillAnalysis(studentId: string) {
  return useQuery({
    queryKey: ['skill-analysis', studentId],
    queryFn: () => fetch(`/api/v1/skill-analysis/${studentId}`).then(r => r.json()),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
```

#### Mutation Hooks

```typescript
// hooks/useMutations.ts
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectFormData) =>
      fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useAwardAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, achievementId }: { studentId: string; achievementId: string }) =>
      fetch(`/api/v1/achievements/${achievementId}/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      }).then(r => r.json()),
    onSuccess: (newAchievement) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['profiles', newAchievement.userId] });
    },
  });
}

export function useApplyForOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ opportunityId, message }: { opportunityId: string; message: string }) =>
      fetch(`/api/v1/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationMessage: message }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
```

### Caching Strategy

| Data | Stale Time | GC Time | Refetch On | Notes |
|------|-----------|---------|-----------|-------|
| User Profile | 5 min | 10 min | Focus | Owner data |
| Projects | 10 min | 20 min | Reconnect | List/personal |
| Hive Gallery | 15 min | 30 min | - | Public data |
| Skills Board | 5 min | 10 min | Focus | Search-driven |
| Leaderboards | 15 min | 30 min | - | Batch updated |
| Opportunities | 10 min | 20 min | Focus | Time-sensitive |
| Skill Analysis | 7 days | 14 days | Manual | Heavy computation |

### Server vs Client Rendering

**Server Components (for SEO & Performance):**
- Homepage (renders featured projects, achievements)
- Public profile pages (shareable URLs)
- Hive Projects Gallery (for search indexing)

**Client Components (interactive):**
- Dashboard pages
- Forms (profile edit, project upload)
- Search/filter components
- Leaderboards (real-time ranking)
- Opportunity application

---

## Implementation Priorities

### MVP (Phase 1 - Weeks 1-8)

**Must-Have Features:**

1. **User Authentication & Profiles**
   - Sign up / login flow
   - Student profile creation and editing
   - Profile viewing for other students
   - Basic skill/project linking

2. **Project Upload & Showcase**
   - Students upload projects with details
   - Project detail pages
   - Technology tagging
   - Basic Hive Projects Gallery

3. **Skills Board**
   - Skill search and listing
   - Student-to-skill mapping
   - Lecturer skill endorsement

4. **Gamification Basics**
   - Points for actions (project upload, cert submission)
   - Level progression (Beginner → Master)
   - Point display on dashboard

5. **Leaderboards**
   - Most active students ranking
   - Points-based leaderboard

6. **Admin Panel**
   - User management
   - Content approval workflow
   - Featured project selection

### Phase 2 (Weeks 9-12)

**Enhancements:**

1. Achievement Wall
2. AI Skill Analyser (basic)
3. Opportunity Board
4. Badge system
5. Advanced leaderboards (most skilled, most projects)

### Phase 3 (Post-MVP)

**Future Features:**

1. Real-time notifications
2. Advanced AI recommendations
3. Social features (comments, follow)
4. Mobile app
5. Employer login & direct applications
6. API for external integrations

---

## AI Integration Points

### OpenAI/Azure API Usage

#### Skill Analysis Endpoint

```typescript
// lib/services/aiSkillAnalysis.ts
export async function analyzeStudentSkills(profile: StudentProfile) {
  const prompt = `
    Analyze this student profile and recommend next skills to learn:
    
    Current Skills: ${profile.skills.map(s => s.name).join(', ')}
    Completed Projects: ${profile.projects.map(p => p.technologies).join(', ')}
    Certifications: ${profile.certifications.map(c => c.title).join(', ')}
    
    Provide JSON response with:
    - suggestedSkills: [{ name, relevance (0-100), timeToMaster }]
    - careerPathways: [{ title, match (0-100), avgSalary }]
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return JSON.parse(response.choices[0].message.content);
}
```

#### Opportunity Matching

```typescript
// Match student skills to opportunities
export async function scoreOpportunityMatch(
  student: StudentProfile,
  opportunity: Opportunity
) {
  const skillOverlap = calculateSkillOverlap(
    student.skills.map(s => s.name),
    opportunity.requirements
  );
  
  // Simple algorithm: opportunity match = skill overlap %
  return Math.round(skillOverlap * 100);
}
```

#### Content Moderation (Future)

```typescript
// Moderate user-generated content for inappropriate material
export async function moderateContent(content: string) {
  const response = await openai.createModeration({
    input: content,
  });

  return response.results[0];
}
```

### AI Usage Optimization

- Cache analysis results (7-day expiry)
- Batch skill analyses (run nightly)
- Rate limit API calls
- Graceful degradation if AI service unavailable
- Show cached result + "Last analyzed X days ago"

---

## Success Metrics

### User Adoption

- **Target:** 80% of enrolled students create profile within 3 months
- **Measurement:** Track sign-up and profile completion rates
- **Success Indicator:** Active user retention month-over-month

### Content Engagement

- **Target:** 40+ Hive projects documented in first semester
- **Target:** 100+ students upload at least one project
- **Measurement:** Project submission count, average projects per student
- **Success Indicator:** Diverse project types (web, mobile, data, etc.)

### Feature Utilization

| Feature | Target | Metric |
|---------|--------|--------|
| Skill Endorsements | 300+ endorsements | Total endorsements count |
| Opportunities | 10+ listings | Active opportunity count |
| Gamification | 60% students actively earning points | Students with points > 0 |
| AI Analysis | 50% of students view analysis | Analysis views per student |
| Leaderboard | 70% of active students check leaderboard | Weekly leaderboard views |

### Performance Metrics

- **Page Load Time:** All pages < 3 seconds (95th percentile)
- **Project Upload:** Complete in 4 or fewer steps (100% compliance)
- **Search Response:** < 500ms for skill search with autocomplete
- **API Uptime:** 99.5% availability

### User Satisfaction

- **NPS Score (Net Promoter Score):** Target 50+
- **Feature Satisfaction:** 4.5/5 or higher across core features
- **Usability Test:** First-time user can create profile in < 5 minutes

### Business Metrics

- **Time to Hire:** Industry partners report reduced time hiring Hive graduates
- **Employer Feedback:** Employers cite platform in hiring decision
- **Visibility:** Hive projects referenced in industry partnerships/sponsorships

---

## Development Guidelines

### Code Quality Standards

1. **TypeScript Strict Mode**
   - No `any` types without justification
   - Full type coverage for database models and API responses

2. **API Design**
   - RESTful conventions
   - Consistent error responses
   - Input validation on all endpoints
   - Pagination for list endpoints (default 10, max 100)

3. **Testing Requirements**
   - Unit tests for database queries
   - Integration tests for API routes
   - Component tests for UI interactions
   - E2E tests for critical user flows

4. **Git Workflow**
   - Branch naming: `feature/`, `fix/`, `refactor/`
   - Commit messages: Conventional Commits format
   - Pull request reviews before merge
   - Protected main branch

### Performance Checklist

- [ ] Database indexes created for frequently queried columns
- [ ] Drizzle queries optimized (no N+1 problems)
- [ ] TanStack Query cache strategy implemented
- [ ] Images optimized (Next.js Image component)
- [ ] Code splitting for heavy components
- [ ] API response pagination configured
- [ ] Lazy loading for infinite lists

### Security Checklist

- [ ] All API endpoints require authentication/authorization
- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Drizzle parameterized queries)
- [ ] CSRF protection enabled
- [ ] Rate limiting on public endpoints
- [ ] Secrets stored in environment variables
- [ ] POPIA compliance reviewed
- [ ] Regular security audits scheduled

---

## Key Focus Areas for AI & Development

### What AI Should Prioritize

1. **Skill Analysis Engine**
   - High accuracy in matching current skills to career paths
   - Relevant learning recommendations
   - Handle edge cases gracefully

2. **Content Quality**
   - AI doesn't generate user-facing content (focus on analysis only)
   - All student content must be human-created
   - Use AI for moderation, not creation

3. **Opportunity Matching**
   - Accurate skill-opportunity correlation
   - Avoid false positives (don't recommend jobs student can't do)
   - Include confidence scoring

### What Developers Should Prioritize

1. **Database Design**
   - Clean schema with proper relationships
   - Appropriate indexes for query performance
   - Migration versioning for schema updates

2. **API Reliability**
   - Error handling for all edge cases
   - Graceful degradation when services fail
   - Comprehensive logging

3. **User Experience**
   - Fast load times (cache appropriately)
   - Intuitive navigation
   - Mobile responsiveness
   - Accessibility (WCAG 2.1 AA)

4. **Data Integrity**
   - Validate data on submit
   - Prevent duplicate submissions
   - Audit trail for admin actions

---

## Conclusion

The HIVE Showcase Platform is a sophisticated, multi-faceted system that serves students, educators, administrators, and industry partners. By leveraging Neon's serverless PostgreSQL, Next.js's full-stack capabilities, ShadCN's component library, TanStack Query's data management, and Drizzle's type-safe ORM, you can build a performant, maintainable, and scalable platform.

**Core Success Factor:** Keep the platform student-focused. Every feature should either help students showcase their talent or recognize their achievements.

---