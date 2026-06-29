# Supabase setup for FireLearn

FireLearn is wired for Supabase-first progress persistence. Do not commit real secrets.

## Required Vercel environment variables

Add these in Vercel Project Settings -> Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional legacy browser key fallback:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server/database-only values must never be exposed to client code:

- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `SUPABASE_SECRET_KEY`

## Apply database schema

Preferred: open Supabase SQL Editor and run:

`supabase/migrations/001_firelearn_progress.sql`

CLI alternative, only when your shell already has a secure database URL:

```bash
POSTGRES_URL_NON_POOLING="postgres://..." npm run supabase:migrate
```

The migration runner reads the connection string from environment variables and never prints it.

## Auth requirement

The current UI uses anonymous Supabase sign-in for quick learner progress. In Supabase dashboard enable:

Authentication -> Providers -> Anonymous Sign-Ins

Production currently points at the Supabase project ref shown in the app's Supabase status card. If the app says anonymous sign-ins are disabled after you enabled them, verify you enabled Anonymous Sign-Ins in the same project as `NEXT_PUBLIC_SUPABASE_URL` in Vercel, then redeploy or refresh the page.

If anonymous sign-in is disabled, the UI will show the Supabase auth error and progress writes will not save.

## Security reminder

If service-role keys, database passwords, JWT secrets, or pooler URLs were pasted into chat/tools, rotate them in Supabase before using the project publicly.
