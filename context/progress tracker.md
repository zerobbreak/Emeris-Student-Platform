# HIVE Showcase Platform — Progress Tracker

> Living log for agents and developers. Update this file after meaningful work. Do not use it to replace the spec docs in `context/`.

---

## Current

- **Feature 01 — Auth & Profiles (implemented)**: **Neon Auth** (`@neondatabase/auth`) for sign-up/sign-in/session; app profile data in Drizzle `users` table synced via `ensureAppUser()`
- **Stack foundation**: ShadCN UI (base-nova), TanStack Query, Zod validation, Emeris brand tokens in `globals.css`
- **Database**: Extended schema (`passwordHash`, `sessions`, `isActive`, `isOnboarded`, indexes); migration `0001_safe_iceman`; skills seed (30 skills) + admin seed script
- **Avatar upload**: Vercel Blob integration (`BLOB_READ_WRITE_TOKEN`)
- **Onboarding**: 4-step wizard; course picker uses IT codes (`BCAD`, `HCERT`, `HON`) via `lib/constants/itCourses.ts`
- **Platform home** (`/dashboard`): post-onboarding hub with welcome hero, stats, and module cards (`PlatformHome`)
- **Hive Community** (`/community`): DEV-style feed with tags sidebar, post cards, trending panel, and composer preview (`CommunityHome` — mock data until Phase 2)

---

## Next

- [ ] Expand Drizzle schema for **projects**, **certifications**, **achievements**, and **gamification** tables (Feature 02+)
- [ ] Wire real **stats** on profile (currently stub zeros until projects/gamification exist)
- [ ] Wire platform home module links when projects, skills board, and leaderboards ship
- [ ] Add **admin panel** route group (`/admin/*`) when Feature requirements land
- [ ] Configure **`NEON_AUTH_BASE_URL`** from Neon Console (Project → Branch → Auth → Configuration) in `.env.local`

---

## Future

- Phase 1 remainder: project upload & Hive gallery, skills board with endorsements, points/levels, leaderboards, admin panel
- Phase 2: Email verification, password reset, OAuth, Achievement wall, AI skill analyser, opportunity board
- Phase 3: Notifications, social features, mobile app, employer login, external API

---

## Fixes

- Auth uses **Neon Auth** (`/api/auth/[...path]`), not custom JWT routes
- Legacy `sessions` table / JWT utils removed from runtime; profile `users` rows sync on login/register

---

## Notes

- **Platform name**: HIVE Showcase Platform for EMERIS IT
- **Auth flow**: Register → `/onboarding` → dashboard; login → `/dashboard`; public profiles at `/profile/[id]`
- **Default seeded admin**: `admin@emeris.ac.uk` (password from `SEED_ADMIN_PASSWORD` in `.env.local`)
- **Last updated**: June 2026 — Hive Community feed page (mock data)
