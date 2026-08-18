# SV Live Super Admin Panel

Next.js (App Router, TypeScript, Tailwind CSS) implementation of the SV Live Super Admin
Panel, built from the Claude Design handoff bundle at the repo root (`README.md`,
`chats/`, `project/SV Live Admin Panel.dc.html`).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/login`.
Auth is UI-only (no real session), so "Sign In" goes straight to `/dashboard`.

## Architecture

- **Routing**: every admin screen lives under the `(admin)` route group
  (`src/app/(admin)/...`), which wraps pages in the shared sidebar + topbar layout.
  Tabs, filters, and category pickers are all URL search-param driven (e.g.
  `/vendors/1?tab=Events`), so every view is a plain server component — no client
  JS is needed for navigation or filtering.
- **Data layer**: `src/lib/data.ts` holds the seed data ported directly from the
  design file's mock data. `src/lib/db.ts` is the in-memory "backend" — the single
  module every page, API route, and server action calls through. Swapping in a real
  database later means reimplementing the functions in `db.ts`; nothing above that
  layer needs to change.
- **API routes**: `src/app/api/**` exposes a REST surface (vendors, customers,
  events, notifications, themes, channels, transactions, wallet-tx, tickets,
  audit-logs, plans) backed by the same `db.ts` functions.
- **Server actions**: `src/lib/actions.ts` has the two functional forms in the
  design — Add Vendor and Create Notification — which write through `db.ts` and
  redirect, no client JS required.
- **Images**: `src/lib/images.ts` maps the design's "image slot" ids to the real
  images that were uploaded into the Claude Design prototype (extracted from
  `.image-slots.state.json` into `public/images/`). Slots without a real image
  render the striped placeholder (`src/components/ui/SlotImage.tsx`).
- **UI kit**: `src/components/ui/*` — StatCard, StatusBadge, Card, Table primitives,
  Tabs/PillTabs/SideList (Link-based), form fields, icons — implements the SV Live
  design tokens (colors, radii, type scale) once, reused across every screen.

## Scope

Every screen present in the `.dc.html` design is implemented: auth (login/forgot/
OTP/reset), dashboard, vendors (list/create/detail), customers (list/detail),
events (list/detail), themes (library/3-pane editor/assignments/categories),
YouTube (overview/channels/streams + detail pages), recordings (placeholder, as
in the source design), payments, wallet, pricing & plans, analytics, reports,
notifications + templates, support tickets, users & roles, settings, audit logs,
and admin profile.
