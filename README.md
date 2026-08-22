# SV Live Super Admin Panel

Next.js (App Router, TypeScript, Tailwind CSS) admin UI for the SV Live platform.

## Getting started

```bash
# Backend (required)
cd ../sv-backend-all && npm run seed && npm run dev

# Admin panel
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:4000/api
                             # set NEXT_PUBLIC_PUBLIC_EVENT_BASE_URL=http://127.0.0.1:3002 (theme live preview)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with seeded admin credentials
(`admin@svlive.in` / `Admin@123` after backend seed).

## Architecture

- **Routing**: admin screens live under the `(admin)` route group with shared sidebar + topbar.
  Tabs and filters are URL search-param driven so most views stay server components.
- **Data layer**: `src/lib/db.ts` maps UI shapes to the MongoDB-backed API in `sv-backend-all`
  via `src/lib/api.ts`. There is no local seed/mock dataset.
- **Auth**: login hits `/api/auth/login`; session cookies are `sv_admin_access`,
  `sv_admin_refresh`, and `sv_admin_user` (JSON profile for topbar/profile).
- **Server actions**: vendor create and notification create go through `src/lib/actions.ts`.
- **UI kit**: `src/components/ui/*` — StatCard, StatusBadge, Card, Table, Tabs, fields, icons.

## Scope

Dashboard, vendors, customers, events, themes, YouTube, recordings, payments, wallet,
pricing, analytics, reports, notifications, support, users & roles, settings, audit logs,
and admin profile — all driven by live API data (empty lists when the DB has no rows).
