# Prisma configuration tests

## Coverage

- [prisma-config.spec.ts](../../prisma/prisma-config.spec.ts) compares Auth models and enums in the Prisma schema with the external-table and external-enum lists, checks app-owned tables are excluded, and checks the shadow-database SQL creates the externally managed Auth users table.

## Test type

Local config and schema consistency test. It reads the Prisma schema file and does not connect to a database.
