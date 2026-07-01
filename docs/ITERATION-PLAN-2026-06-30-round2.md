# FireLearn Five-Phase Iteration Plan — Round 2

Generated: 2026-06-30 (round 2)
Status: Active

## Baseline
- 57 tests passing, typecheck clean, lint clean, build clean (138 static pages)
- Round 1 completed: iteration plan, ranked search, next-action engine, lesson navigation, catalog metrics

## Phase 1 — Quiz engine deepening
Scope:
- Extract exam bank builder logic into a testable service with real question selection and shuffle.
- Add tests for exam bank size, shuffle determinism, and weak-topic prioritization.

## Phase 2 — Quiz result recording pipeline
Scope:
- Add a testable service that records quiz results to local persistence and records study activity.
- Wire QuizEngine to use the service instead of inline localStorage calls.
- Add regression tests.

## Phase 3 — Profile data integrity
Scope:
- Add a service that validates exported JSON shape before re-import or display.
- Add tests for valid exports, malformed data, and partial data handling.

## Phase 4 — Command palette keyboard navigation
Scope:
- Add arrow-key + Enter navigation to the command palette.
- Keep Escape to close, Cmd+K to toggle.

## Phase 5 — Content coverage report
Scope:
- Add a service that computes topic coverage across the catalog (which topics have quizzes, flashcards, and lessons).
- Add tests and surface a summary in the README.

## Done definition
Each phase: code committed, tests/typecheck/lint/build pass, pushed to main.
