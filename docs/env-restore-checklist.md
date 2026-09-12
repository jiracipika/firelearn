# FireLearn → firelearn-app (Vercel) env var restore sheet
# Paste real values from supabase.com → your project → Settings → API + Database
# Then add to the new Vercel project (firelearn-app) via:
#   vercel env add KEY production   (from ~/projects/firelearn)
# or Dashboard → firelearn-app → Settings → Environment Variables.
#
# Browser-safe (NEXT_PUBLIC_*) — these appear in client bundles:
NEXT_PUBLIC_SUPABASE_URL=            # https://<ref>.supabase.co  (Settings → API → Project URL)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= # sb_publishable_... (API keys → publishable)
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # eyJ... legacy anon (only if still in use)

# Server-only — NEVER expose to client:
SUPABASE_SECRET_KEY=                 # sb_secret_... (API keys → secret)
SUPABASE_URL=                        # same URL as NEXT_PUBLIC_SUPABASE_URL
SUPABASE_ANON_KEY=                   # same as anon above
SUPABASE_PUBLISHABLE_KEY=            # same as publishable above
SUPABASE_JWT_SECRET=                 # Settings → API → JWT Secret

# Postgres connection strings (Settings → Database → Connection string):
POSTGRES_URL=                        # pooled (port 6543, pgbouncer=true)
POSTGRES_PRISMA_URL=                 # pooled + pgbouncer=true
POSTGRES_URL_NON_POOLING=            # direct (port 5432) — for migrations
POSTGRES_HOST=                       # db.<ref>.supabase.co
POSTGRES_USER=                       # postgres
POSTGRES_PASSWORD=                   # db password (reset if unknown)
POSTGRES_DATABASE=                   # postgres
