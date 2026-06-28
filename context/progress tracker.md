# HIVE Showcase Platform — Progress Tracker

> Living log for agents and developers. Update this file after meaningful work. Do not use it to replace the spec docs in `context/`.

---

## Current

- **Feature 01 — Auth & Profiles (implemented)**: **Supabase Auth** (`@supabase/ssr`) for sign-up/sign-in/session; app profile data in Drizzle `users` table synced via `ensureAppUser()`
- **Stack foundation**: ShadCN UI (base-nova), TanStack Query, Zod validation, Emeris brand tokens in `globals.css`
- **Database**: **Supabase PostgreSQL** via Drizzle (`postgres-js`); queries in `lib/db/queries/`; data access via server actions (`lib/actions/`) — no `/api/v1` routes
- **Avatar & post images**: Supabase Storage (`platform-images` bucket) via `lib/supabase/storage.ts` — avatars, feed, and community uploads
- **Onboarding**: 4-step wizard; course picker uses IT codes (`BCAD`, `HCERT`, `HON`) via `lib/constants/itCourses.ts`
- **Platform shell** (`app/(dashboard)/layout.tsx`): `PlatformShell` 3-panel layout on all dashboard child routes — `PlatformNavPanel` (left), `{children}` (center), `PlatformFeedPanel` (right)
- **Platform home** (`/dashboard`): cohort feed via `CommunityHome` with shared `PlatformPageHero`
- **Hive Community** (`/community`): project listings, assistance requests, and tips via `CommunityProjectsFeed`
- **Hive Projects** (`/hive-projects`): gallery with top projects, course filters, and field guides/sources for niche domains via `HiveProjectsHome` (mock data until Phase 2)
- **Create post FAB**: expandable menu on `/dashboard` and `/community` — **Feed post** (`CreatePostDialog` → `feed_posts`) and **Project post** (`CreateProjectPostDialog` → `community_posts` with kind project/assistance/tip)
- **Feed interactions**: Implemented Comment Like system, including UI and backend logic (`feedPostCommentLikes` schema).

---

## Next

- [ ] Expand Drizzle schema for **projects**, **certifications**, **achievements**, and **gamification** tables (Feature 02+)
- [ ] Wire real **stats** on profile (currently stub zeros until projects/gamification exist)
- [ ] Wire platform home module links when skills board and leaderboards ship
- [ ] Add **admin panel** route group (`/admin/*`) when Feature requirements land
- [ ] Set **`DATABASE_URL`**, **`NEXT_PUBLIC_SUPABASE_URL`**, and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** in `.env.local`
- [ ] Run **`supabase/storage.sql`** in Supabase SQL Editor to create the `platform-images` bucket and RLS policies

---

## Future

- Phase 1 remainder: project upload & Hive gallery, skills board with endorsements, points/levels, leaderboards, admin panel
- Phase 2: Email verification, password reset, OAuth, Achievement wall, AI skill analyser, opportunity board
- Phase 3: Notifications, social features, mobile app, employer login, external API

---

## Fixes

- Auth uses **Supabase Auth** with SSR cookie sessions; profile `users` rows sync on login/register/callback
- Data layer: Drizzle queries in `lib/db/queries/`; client hooks call server actions instead of REST API
- Fixed Drizzle schema access error (`TypeError: Cannot read properties of undefined (reading 'findMany')`) on `feedPostCommentLikes` by ensuring it's exported and accessible in `lib/db/queries/feed.ts`.

---

## Notes

- **Platform name**: HIVE Showcase Platform for EMERIS IT
- **Auth flow**: Register → `/onboarding` → dashboard; login → `/dashboard`; public profiles at `/profile/[id]`
- **Default seeded admin**: `admin@emeris.ac.uk` (password from `SEED_ADMIN_PASSWORD` in `.env.local`)
- **Last updated**: June 2026 — Comment likes system implementation and Drizzle schema access fix
