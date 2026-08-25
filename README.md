
# Smart Attendance Web Dashboard

This dashboard is connected to the FastAPI backend through Kong.

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_API_BASE_URL` – Kong URL, normally `http://localhost:8000`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

The browser never calls AI Vision directly.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Authentication

Login is performed by Supabase Auth. The backend is the authority for the user's role and active status. A successful Supabase session is immediately checked against `/scheduling/users/me` before the dashboard is opened.

## Backend routing

- `/scheduling/*` -> Scheduling Service
- `/attendance/*` -> Attendance Service
- AI Vision remains private behind the internal network and RabbitMQ.
