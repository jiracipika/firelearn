# FireLearn Five-Phase Iteration Plan — Round 3

Generated: 2026-06-30 (round 3)
Status: Active

## Baseline
- Round 1 completed: ranked search, next-action engine, lesson navigation, catalog metrics.
- Round 2 completed: weak-topic exam banks, quiz recording pipeline, data integrity validation, command palette keyboard navigation, topic coverage report.
- Current quality target: preserve full test/typecheck/lint/build green after every phase.

## Phase 1 — Verification command contract
Scope:
- Add a top-level `npm run verify` command so FireLearn has one release gate like Dashverse.
- Document the exact verification contract in this round plan.

## Phase 2 — Catalog source-reference verifier
Scope:
- Add a zero-dependency Node verifier for course references.
- Fail if lessons have no references, blank references, or obvious placeholder references.

## Phase 3 — Learning path planner service
Scope:
- Add a tested service that groups courses by category/difficulty and recommends a stable learner path.
- Use this as a backend-ready primitive for future onboarding.

## Phase 4 — Flashcard session summary service
Scope:
- Add a tested service that summarizes reviewed flashcards, rating counts, next due dates, and retention signals.
- Keep it independent of React so it can power dashboard/profile later.

## Phase 5 — Production smoke script
Scope:
- Add a checked-in script that verifies public production markers for fflearn.vercel.app.
- Keep it optional in local `verify` so offline/local CI does not depend on network.

## Done definition
Each phase: source changed, verified, committed, pushed to main, commit hash recorded.
