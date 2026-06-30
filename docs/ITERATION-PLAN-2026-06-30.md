# FireLearn Five-Phase Iteration Plan

Generated: 2026-06-30
Owner: Hermes Agent
Target production URL: https://fflearn.vercel.app
Repository: https://github.com/jiracipika/firelearn

## North-star outcome
FireLearn should feel like a serious firefighter learning cockpit, not a demo. Every visible progress number must be traceable to learner activity, every lesson should have an obvious next action, search should route learners quickly to practice material, and production should remain verifiable after each push.

## Guardrails
- Supabase-first when environment variables are present; local-first adapters remain the fallback.
- No fake progress, fake videos, or unsupported certification claims.
- Each phase must pass typecheck, lint, tests, and build before being considered done.
- Public production verification should prove a deployed route/content marker, not just a 200 from the homepage.

## Phase 1 — Planning and baseline hardening
Scope:
- Record this explicit plan in-repo so future passes have a stable execution contract.
- Keep the existing overhaul plan aligned with completed work instead of stale checkboxes.
- Verify the current baseline before feature edits.

Deliverables:
- docs/ITERATION-PLAN-2026-06-30.md
- docs/OVERHAUL-PLAN.md status refresh

Verification:
- npm run typecheck
- npm run lint
- npm run test
- npm run build

## Phase 2 — Search relevance and routing
Scope:
- Replace pure substring filtering with ranked multi-token search.
- Weight exact title/type matches above long-description matches.
- Route quiz and flashcard search results to the owning lesson filters instead of generic pages.

Deliverables:
- Ranked search helpers in lib/search.ts
- Regression tests for ranking, token matching, and scoped result links

Verification:
- npm run test -- lib/search.test.ts
- npm run typecheck
- npm run lint
- npm run build

## Phase 3 — Dashboard next-action engine
Scope:
- Add a testable service that decides the learner's highest-value next action from completion, quiz, weak-topic, and due-card signals.
- Surface that output on the dashboard so the cockpit tells users what to do next instead of only showing stats.

Deliverables:
- services/next-action.ts
- services/next-action.test.ts
- Dashboard card wired to the service

Verification:
- npm run test -- services/next-action.test.ts
- npm run typecheck
- npm run lint
- npm run build

## Phase 4 — Lesson study flow polish
Scope:
- Extract lesson sequencing helpers into a testable service.
- Use the service in lesson pages so prev/current/next behavior is stable and regression-tested.
- Improve lesson calls-to-action for quiz and flashcard practice.

Deliverables:
- services/lesson-navigation.ts
- services/lesson-navigation.test.ts
- LessonView updated to consume the helper

Verification:
- npm run test -- services/lesson-navigation.test.ts
- npm run typecheck
- npm run lint
- npm run build

## Phase 5 — Production verification and source trust
Scope:
- Add a deterministic source/coverage summary that can be tested locally and used in copy.
- Document how to verify production after Vercel deploys main.
- Keep public claims grounded in actual course/lesson/question/video counts.

Deliverables:
- services/catalog-metrics.ts
- services/catalog-metrics.test.ts
- README production verification section

Verification:
- npm run test
- npm run typecheck
- npm run lint
- npm run build
- curl production route after deploy if network/deployment timing permits

## Done definition for all five phases
A phase is only done when:
1. Code or documentation is committed.
2. Local verification passes.
3. The commit is pushed to origin/main.
4. The chat report includes files changed, verification output, and commit hash.
