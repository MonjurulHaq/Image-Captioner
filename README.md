# Sondhan AI

Sondhan AI is a lost-and-found web app for students. People can report lost items, report found items, search, claim matches, and chat with the AI assistant.

Live demo: https://image-captioner--monjurulr1.replit.app

## What you need

Install these first:

- Node.js 24 or newer
- `pnpm`
- PostgreSQL 16 or any PostgreSQL database you can connect to
- A Gemini API key

Use `pnpm`, not `npm` or `yarn`. This repo blocks the other package managers on purpose.

## Local setup

### 1) Install dependencies

From the repo root:

```bash
pnpm install
```

### 2) Create the database

Make a PostgreSQL database and keep the connection string handy. You will need it for `DATABASE_URL`.

### 3) Set the required environment variables

The app does not start unless these are set.

For the API server terminal:

```bash
export DATABASE_URL="postgres://user:password@localhost:5432/sondhan"
export GEMINI_API_KEY="your-gemini-api-key"
export SESSION_SECRET="change-this-to-a-long-random-string"
export PORT="8080"
```

For the frontend terminal:

```bash
export PORT="21282"
export BASE_PATH="/"
```

Notes:

- `JWT_SECRET` is optional. If you do not set it, the API falls back to `SESSION_SECRET`.
- The API listens on port `8080`.
- The frontend listens on port `21282`.
- The API base path is `/api`.

### 4) Prepare the database schema

Push the Drizzle schema to PostgreSQL:

```bash
pnpm --filter @workspace/db run push
```

If you want to force it:

```bash
pnpm --filter @workspace/db run push-force
```

### 5) Start the API server

In one terminal:

```bash
pnpm --filter @workspace/api-server run dev
```

The server health check should answer here:

```text
http://localhost:8080/api/healthz
```

### 6) Start the frontend

In a second terminal:

```bash
pnpm --filter @workspace/sondhan run dev
```

Open this in your browser:

```text
http://localhost:21282
```

## Build and check

- `pnpm run typecheck` - typecheck the workspace
- `pnpm run build` - typecheck and build everything
- `pnpm --filter @workspace/api-spec run codegen` - regenerate API client and Zod types from the OpenAPI file

## Demo accounts

If the seeded data is present, these are the demo logins:

- Admin: `admin@sondhan.ai` / `admin123`
- Student: `rahim@buet.ac.bd` / `student123`

## If it breaks

- If the API says `PORT environment variable is required`, set `PORT=8080` before starting it.
- If the frontend says `BASE_PATH environment variable is required`, set `BASE_PATH=/` before starting it.
- If the API says `DATABASE_URL must be set`, your database env var is missing or wrong.
- If AI features fail, check `GEMINI_API_KEY`.

## What runs where

- Frontend: `artifacts/sondhan`
- API server: `artifacts/api-server`
- Database schema: `lib/db`
- Shared API contract: `lib/api-spec/openapi.yaml`

## File structure

```text
Image-Captioner/
├── artifacts/
│   ├── api-server/                  # Express API server
│   │   ├── src/
│   │   │   ├── routes/              # API route handlers
│   │   │   ├── middlewares/         # Auth/admin middlewares
│   │   │   └── lib/                 # Logger, auth helpers
│   │   └── build.mjs                # API build script (esbuild)
│   ├── sondhan/                     # Main React frontend (Vite)
│   │   └── src/
│   │       ├── pages/               # App pages (Dashboard, Search, etc.)
│   │       ├── components/          # Shared UI and layout components
│   │       ├── hooks/               # React hooks (auth, toast, mobile)
│   │       └── lib/                 # Frontend utility functions
│   └── mockup-sandbox/              # UI sandbox app
├── lib/
│   ├── api-spec/                    # OpenAPI source + Orval config
│   │   ├── openapi.yaml
│   │   └── orval.config.ts
│   ├── api-client-react/            # Generated React Query API client
│   │   └── src/generated/
│   ├── api-zod/                     # Generated Zod schemas/types from API
│   │   └── src/generated/
│   └── db/                          # Drizzle schema + DB connection
│       └── src/schema/
├── scripts/                         # Workspace utility scripts
├── package.json                     # Root workspace scripts
├── pnpm-workspace.yaml              # Workspace package list
└── README.md
```
