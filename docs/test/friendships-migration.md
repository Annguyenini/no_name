# Friendships migration tests

## Coverage

- [friendships.spec.ts](../../test/migrations/friendships.spec.ts) checks that the `friendships` schema and table exist, the table has the expected columns, the relationship enum has the expected labels, primary and user foreign keys exist, UUID ordering is enforced by a validated check constraint, and both status lookup indexes exist.

## Test type and dependencies

Database migration verification using live PostgreSQL metadata queries through Prisma. The test requires a configured, migrated database.
