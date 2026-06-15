# Sondhan AI

Bangladesh's first AI-powered Lost & Found platform for universities — students report, search, and recover lost items with Gemini-powered matching and a Bengali/English chat assistant.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/sondhan run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `GEMINI_API_KEY`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 at `artifacts/api-server`
- Frontend: React + Vite + shadcn/ui + Tailwind at `artifacts/sondhan`
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Auth: JWT (`jsonwebtoken`) + bcryptjs — **not bcrypt** (native build unavailable)
- AI: `@google/genai` SDK directly with `GEMINI_API_KEY`
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Charts: Recharts

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/db/src/schema/` — DB schema (users, lost-items, found-items, claims, notifications)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-client-react/src/custom-fetch.ts` — injects JWT from localStorage
- `artifacts/api-server/src/routes/` — all backend routes
- `artifacts/api-server/src/lib/auth.ts` — JWT sign/verify + bcryptjs password hashing
- `artifacts/sondhan/src/pages/` — all frontend pages
- `artifacts/sondhan/src/hooks/useAuth.tsx` — auth context (reads from localStorage)

## Architecture decisions

- **bcryptjs over bcrypt**: Native `bcrypt` can't build in this env; `bcryptjs` is the pure-JS drop-in that works without native binaries.
- **JWT in localStorage**: Token stored as `sondhan_token`, user as `sondhan_user` (JSON). Custom fetch injects it as `Authorization: Bearer`.
- **Flat array → `{ items, total }` wrapper**: All list endpoints return `{ items, total }` so frontend hooks get pagination data.
- **Gemini AI direct**: Routes in `ai.ts` use `@google/genai` SDK directly (not the Replit proxy), keyed off `GEMINI_API_KEY`.
- **Role-based routing**: Admin routes protected by `requireAdmin` middleware; frontend redirects non-admin to `/dashboard`.

## Product

- Public landing page with live stats and recent items
- Search page (public): filter lost/found items by text + category
- Auth: JWT login/register with demo accounts
- Dashboard: personal stats, quick actions, recent activity
- Lost Items: report form + Gemini AI matching per item
- Found Items: report form + "This is Mine" claim button
- Claims: track claim status (Pending → Approved → Returned)
- Notifications: real-time in-app alerts with mark-read
- AI Assistant: bilingual chatbot (Bengali + English) powered by Gemini
- Admin panel: Claims management (approve/reject/mark returned), user management, Recharts analytics

## Demo Credentials

- Admin: `admin@sondhan.ai` / `admin123`
- Student: `rahim@buet.ac.bd` / `student123`

## User preferences

_Populate as you build._

## Gotchas

- **Never use `bcrypt`** — use `bcryptjs` instead. Native binaries can't be compiled in this env.
- API list routes must return `{ items, total }` shape — the generated hooks expect this.
- After changing routes, always rebuild the server: `pnpm --filter @workspace/api-server run build`
- `SESSION_SECRET` env var is used as JWT_SECRET fallback (see `auth.ts`).
- Seeded demo user passwords were set by registering a temp user to get a valid bcryptjs hash, then copying that hash via SQL.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
