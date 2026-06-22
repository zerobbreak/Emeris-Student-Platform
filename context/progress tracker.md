# HIVE Showcase Platform — Progress Tracker

> Living log for agents and developers. Update this file after meaningful work. Do not use it to replace the spec docs in `context/`.

---

## Current

- **Project scaffold**: Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript
- **Database foundation**: Neon serverless client (`lib/db/client.ts`), Drizzle ORM schema with `users`, `skills`, `user_skills` tables and relations
- **Migrations**: Initial migration generated (`drizzle/0000_unusual_johnny_blaze.sql`); `db:generate`, `db:migrate`, `db:push`, `db:studio` scripts configured
- **Context documentation**: Product spec (`idea-context.md`), stack guide (`best-practices.md`), Emeris design system (`design patterns.md`)
- **Cursor rule**: `.cursor/rules/project-context.mdc` points agents to the `context/` folder and workflow conventions

---

## Next

- [ ] Install and configure **ShadCN UI** and **TanStack Query** (specified in stack, not yet in dependencies)
- [ ] Apply **Emeris brand tokens** from `design patterns.md` to `app/globals.css` and Tailwind theme (replace default zinc/black palette)
- [ ] Set up **auth** (sign up / login) — Phase 1 MVP priority per `idea-context.md`
- [ ] Expand Drizzle schema for **projects**, **certifications**, **achievements**, and **gamification** tables
- [ ] Replace default **homepage** with HIVE Showcase landing/dashboard shell
- [ ] Implement **student profile** create, edit, and public view routes per UI architecture in `idea-context.md`

---

## Future

- Phase 1 remainder: project upload & Hive gallery, skills board with endorsements, points/levels, leaderboards, admin panel
- Phase 2: Achievement wall, AI skill analyser, opportunity board, badge system
- Phase 3: Notifications, social features, mobile app, employer login, external API
- Populate `architecture.md` with a dedicated high-level diagram and system overview (currently empty — architecture detail lives in `idea-context.md` for now)

---

## Fixes

- `context/architecture.md` is empty — agents should use `idea-context.md` until this file is filled in by the team
- Homepage still uses the default **create-next-app** template; not branded or feature-aware
- `app/globals.css` uses generic colors, not Emeris palette from `design patterns.md`
- Git shows `context/ui patterns.md` deleted and `context/design patterns.md` added — treat **design patterns.md** as the canonical design reference
- Stack deps in `package.json` are partial: Drizzle/Neon present; ShadCN and TanStack Query not yet installed

---

## Notes

- **Platform name**: HIVE Showcase Platform for EMERIS IT — student portfolios, Hive projects, skills, gamification, opportunities
- **Core principle** (from spec): Keep the platform student-focused; every feature should help students showcase talent or earn recognition
- **Agent workflow**: Read `context/` before implementing; never edit spec files (`idea-context.md`, `architecture.md`, `design patterns.md`, `best-practices.md`); update this tracker after sessions
- **Last reviewed**: June 2026 — early MVP / foundation stage; database schema covers users and skills only
