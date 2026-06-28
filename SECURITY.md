# Security Notes

FireLearn is currently a static educational platform prototype. It does not yet store user accounts, department data, quiz history, or certification records.

## Current audit status

`npm audit` currently reports a moderate PostCSS advisory through Next.js 16.2.9's bundled dependency tree. Next.js 16.2.9 is the latest available release at the time of this change, and npm's suggested automated fix incorrectly downgrades Next to 9.3.3. Do not apply that downgrade.

Mitigation until the framework publishes a patched dependency tree:

- Keep user-generated CSS out of the application.
- Keep dependencies current.
- Re-run `npm audit` during each production hardening pass.
- Upgrade Next.js as soon as a patched release is available.

## Future production requirements

Before enabling Supabase/Postgres user data, add:

- Authentication and authorization tests.
- Row-level security policies.
- Server-side validation for all writes.
- Rate limiting for quiz, search, and AI tutor endpoints.
- Audit logging for instructor/department features.
