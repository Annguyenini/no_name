# Users migration tests

## Coverage

- [users.spec.ts](../../test/migrations/users.spec.ts) checks the `users` schema and table, expected user columns, `active`/`ban`/`deactivate` status enum labels, and primary and Auth foreign-key constraints.

## Test type and dependencies

Database migration verification using live PostgreSQL metadata queries through Prisma. The test requires a configured, migrated database.
