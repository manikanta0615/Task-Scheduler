# Task Scheduler

A simple, clean, single-page task scheduling app. Authenticated users can create, view,
edit, delete, complete, filter, and search their daily tasks.

## Technology Stack

- React + TypeScript + Vite (TanStack Start / TanStack Router)
- Tailwind CSS + shadcn/ui + Lucide icons
- Lovable Cloud (Supabase: PostgreSQL, Auth, Row Level Security)
- Email/password + Google OAuth sign-in

## Features

- Login, registration, forgot/reset password, Google sign-in
- Protected routes: unauthenticated users are redirected to `/login`
- Task CRUD with title, description, scheduled date/time, priority, status
- Filters: Today, Upcoming, Completed, Pending, All — plus search and priority filter
- Sorted by date, then time, then priority; completed tasks sink to the bottom
- Friendly empty, loading, and error states; toast notifications

## Routes

| Route | Access |
| --- | --- |
| `/` | Redirects to `/tasks` (signed in) or `/login` |
| `/login` | Public |
| `/register` | Public |
| `/forgot-password` | Public |
| `/reset-password` | Public (recovery link target) |
| `/auth/callback` | Public (OAuth return) |
| `/tasks` | Authenticated only |

## Database

Schema lives in `drizzle/migrations/` (applied via Lovable Cloud migrations):

- `profiles` — one row per user (`user_id` → `auth.users`), auto-created on signup by trigger
- `tasks` — belongs to a user; CHECK constraints on priority (`low|medium|high`) and
  status (`pending|completed`); non-empty title; indexes on `user_id`, `scheduled_date`,
  `status`, and `(user_id, scheduled_date)`
- `updated_at` maintained by a trigger on both tables
- Row Level Security enabled on both tables: users can only read/insert/update/delete
  their own rows (`auth.uid() = user_id`)

## Authentication

- Email/password and Google OAuth are handled by Lovable Cloud Auth (Supabase Auth).
- Sessions persist across refreshes via the Supabase JS client.
- Password reset uses Supabase recovery emails pointing at `/reset-password`.
- Google sign-in uses the managed Lovable OAuth broker; to use your own Google Cloud
  OAuth client instead, open Cloud → Users → Auth Settings → Sign In Methods → Google
  and enter your client ID/secret there (never in code).

## Local Development

```bash
bun install
bun run dev
```

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are injected
automatically by Lovable Cloud; see `.env.example` if running elsewhere.

## Security Notes

- No service-role key or OAuth secret exists in frontend code.
- All task/profile access is enforced by database RLS, not the UI.
- The app never trusts a `user_id` from the browser — inserts use the authenticated user.

## Deployment

Publish from Lovable (Publish button). The backend, auth, and hosting deploy together;
no separate Vercel/Supabase setup is required.
