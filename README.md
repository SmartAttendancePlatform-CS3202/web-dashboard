# web-dashboard

Next.js admin/lecturer dashboard for PID 12 / Group 24's Smart
Attendance and Classroom Access Platform.

Talks to the `scheduling-service` and `attendance-service` FastAPI
services (see the sibling `backend` repo) and directly to Supabase
for auth.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project + backend URLs
npm run dev
```

Runs at http://localhost:3000. If you're also running the backend
locally via `docker compose up` in the `backend` repo, point
`NEXT_PUBLIC_SCHEDULING_SERVICE_URL` at `http://localhost:8001` and
`NEXT_PUBLIC_ATTENDANCE_SERVICE_URL` at `http://localhost:8002`
instead of the deployed URLs.

## Structure

```
src/
├── app/            # Next.js App Router pages
├── components/      # shared UI components
├── lib/
│   ├── supabase/    # Supabase client (auth)
│   └── api/         # backend service base URLs + authenticated fetcher
└── types/
```

## Deploying

Deploy via **Vercel's native GitHub integration** — connect this repo
in the Vercel dashboard, it auto-detects Next.js, and every push to
`main` deploys automatically with zero extra config. Add the
`.env.example` variables under Vercel's Project Settings → Environment
Variables. No custom GitHub Action needed for deployment — the
`ci.yml` workflow here just runs lint + build as a PR check.

## Auth

Uses Supabase Auth directly (`src/lib/supabase/client.ts`). Backend
API calls attach the current session's JWT via `src/lib/api/fetcher.ts`
— the backend services verify it using the same `SUPABASE_JWT_SECRET`
you'll set in the `backend` repo's service `.env` files.
