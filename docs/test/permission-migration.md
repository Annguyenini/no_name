# Permission migration tests

## Coverage

- [permission.spec.ts](../../test/migrations/permission.spec.ts) checks the `permission` schema and table, expected columns, `admin` and `user` role enum labels, and primary and user foreign-key constraints.

## Test type and dependencies

Database migration verification using live PostgreSQL metadata queries through Prisma. The test requires a configured, migrated database.
