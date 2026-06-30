# FireLearn Full Overhaul Plan

Generated: 2026-06-30
Status: Active

## Current State
- Next.js 16 + React 19 + Tailwind 4 + Supabase + framer-motion
- 32 courses, 64 lessons, 253 quiz questions
- Deployed: fflearn.vercel.app (Supabase: iwcalmxtokxohdgemwjs)
- Health: typecheck PASS, lint PASS, 42/42 tests PASS

## Bugs Found

### Critical
1. **Fake progress everywhere** — `data/progress.ts` hardcodes streakDays:23, xp:8420, level:12. Weekly heatmap hardcoded. Leaderboard fake. Dashboard overlays real XP on fake base.
2. **Flashcard reviews never sync to Supabase** — no write function, no call site. `flashcard_reviews` table unused. "SCBA Review Block" challenge can never progress.
3. **Exam mode doesn't shuffle** — `collectQuestionBank` exam mode uses deterministic `localeCompare`. `buildExamQuestionBank` (real shuffle) exists but never called.
4. **Dead offline system** — `useOfflineProgress` hook never imported. `SupabaseSyncButton` never imported. Sync queue infrastructure unused.
5. **`getFeaturedLesson()` unsafe** — crashes if `academyCourses` empty.

### High
6. **Quiz page lies** — title says "253 questions" but only loads 12.
7. **Landing stats wrong** — "29 Disciplines" (actually 32), "192 Videos" (zero exist).
8. **Knowledge check non-interactive** — static list, no click/reveal.
9. **Lesson view dead ends** — no next/prev nav, no inline quiz/card links.
10. **"Courses in progress" wrong** — shows hardcoded progress courses user never started.

### Medium
11. **Live JS exception** — uncaught error on production.
12. **`/lesson` orphan route** — redundant, nothing links to it.
13. **No flashcard Supabase sync** — missing function + sync.ts handler.
14. **Unused assets** — hero-fireground.png, fluentui-logo.svg.
15. **Profile page thin** — no settings, sign-out, export.

## Overhaul Phases

### Phase 1: Critical Bug Fixes
- [ ] P1-1: Real computed progress (replace fake hardcoded values)
- [ ] P1-2: Flashcard Supabase sync
- [ ] P1-3: Fix exam mode shuffle
- [ ] P1-4: Wire offline system UI
- [ ] P1-5: Guard all array access

### Phase 2: High Bug Fixes
- [ ] P2-1: Fix quiz question count display
- [ ] P2-2: Fix landing page stats
- [ ] P2-3: Interactive knowledge check
- [ ] P2-4: Lesson navigation + inline links
- [ ] P2-5: Fix courses-in-progress filter

### Phase 3: UX/Design Polish
- [ ] P3-1: Command palette search (Cmd+K)
- [ ] P3-2: Profile page enhancements
- [ ] P3-3: Real empty states
- [ ] P3-4: Per-section loading skeletons
- [ ] P3-5: Remove orphan route + unused assets
- [ ] P3-6: Fix hydration/JS exception

### Phase 4: Feature Enhancements
- [ ] P4-1: Per-lesson quiz/flashcard integration
- [ ] P4-2: Real streak tracking
- [ ] P4-3: Study session timer
- [ ] P4-4: Course completion certificate
- [ ] P4-5: Dark/light theme toggle
- [ ] P4-6: Mobile bottom nav

### Phase 5: Content & Performance
- [ ] P5-1: Server-side data loading
- [ ] P5-2: Expand generic courses
- [ ] P5-3: Real NFPA references
