# FireLearn

FireLearn is a Next.js 16 firefighter learning platform with course paths, embedded tutorials, scenario-heavy quizzes, flashcards, progress tracking, and Supabase-backed learner sync.

## Current content inventory

Public content-count claims must be computed from `data/academy.ts`, not hand-entered marketing numbers. Use `services/catalog-metrics.ts` and its tests when changing the catalog.

Current local verification target:

```bash
npm run test -- services/catalog-metrics.test.ts
```

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Full local verification

Run this before every push to `main`:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Production verification

Production is expected at:

```text
https://fflearn.vercel.app
```

After a `main` push and Vercel deployment, verify more than homepage reachability:

```bash
curl -fsSL https://fflearn.vercel.app/ | grep -E "FireLearn|firefighter learning console"
curl -fsSL https://fflearn.vercel.app/search | grep -E "Search FireLearn|Global search"
curl -fsSL https://fflearn.vercel.app/courses/reading-smoke-and-fire-growth | grep -E "Reading Smoke|Smoke"
```

If a route still serves old content, wait for Vercel to finish deployment and retry before declaring production verified.

## Supabase and learner completion

Progress is written locally first so lesson completion remains reliable offline, then synchronized to Supabase when an authenticated session is available. Course pages merge local and Supabase completion records, resume at the first unfinished lesson, and expose queued-sync state without hiding local progress.

Completion certificates are unlocked only after every lesson in the course has been verified from the merged progress record. This certificate remains an educational study record, not an official certification.

See `docs/supabase-setup.md` and `supabase/migrations/001_firelearn_progress.sql` for backend setup.

## v0

This repository is linked to a v0 project. v0 can still push directly, so always `git pull --ff-only origin main` before editing.

[Continue working on v0 →](https://v0.app/chat/projects/prj_npfcL00FUu2eaAKObLrc5QnpIDNf)
