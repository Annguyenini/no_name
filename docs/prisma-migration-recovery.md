# Prisma migration recovery

## Prisma ownership boundary

Prisma Client needs models for some Supabase Auth tables because application tables reference `auth.users` and the API reads Auth records. Those models remain in `prisma/schema.prisma`, but `prisma.config.ts` declares every `auth` table and enum as externally managed. Prisma Client can still query them; Prisma Migrate ignores them when calculating and applying new migrations.

`externalTables` is a Prisma preview feature. Keep the lists in `prisma.config.ts` aligned with the `@@schema("auth")` models and enums. The unit test `prisma/prisma-config.spec.ts` checks that every Auth model and enum is listed.

The historical `0_init` migration contains Supabase Auth DDL because it was reconstructed from the existing database. Do not edit or delete that migration: it is already recorded as applied in the deployed databases. Existing projects must retain their baseline history. For any new Supabase project, verify and baseline its existing managed Auth objects before deploying this migration history; do not let Prisma replay the historical Auth DDL against tables Supabase already created.

## Future migration flow

1. Make application schema changes in `prisma/schema.prisma`; leave Supabase-managed Auth models and enums unchanged unless Supabase changes them.
2. Generate a migration against a disposable development database with `npx prisma migrate dev --name <change-name>`. Do not use a shared Supabase test or production database for migration development or reset.
3. Review the generated `migration.sql`. It should change only app-owned objects in `users`, `permission`, and `friendships`.
4. Apply the reviewed migration to the test database and production with `npx prisma migrate deploy` after confirming the configured URL targets the intended environment.
5. Confirm with `npx prisma migrate status`.

`DIRECT_URL` takes precedence over `DATABASE_URL` in `prisma.config.ts`; verify both when checking the migration target. Never use `prisma migrate reset` against a shared Supabase project. A reset can partially remove app tables and then fail on Auth tables that the database role does not own.

## Supabase generated columns

Supabase has several generated columns in its `auth` schema. PostgreSQL rejects `DEFAULT` expressions that refer to another column. In migration SQL, represent these as generated columns:

```sql
"email" TEXT GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED
```

In `auth.scim_users`, `user_name`, `external_id`, and `active` are also derived from `resource`; define them with `GENERATED ALWAYS AS (...) STORED` using the expressions in the baseline migration.

In `auth.users`, `confirmed_at` is derived from `email_confirmed_at` and `phone_confirmed_at` and must also be a stored generated column.

This lets PostgreSQL replay the baseline in a Prisma shadow database. `prisma migrate dev` replays the checked-in migrations before it creates a new migration.

## Applied migration history

The configured Supabase database contained two applied baseline markers, `0_init` and `0_init_supabase`, each with `applied_steps_count = 0`. The original migration files were absent locally. `0_init` is now the canonical replayable baseline reconstructed from the Prisma schema; `0_init_supabase` is retained as a no-op so replay does not attempt to create the same schema twice. The baseline checksums were conditionally reconciled in this database. The `0_init` checksum is `6356418e513f109d442d2d83385d8f7a50a3d9ba255352f34e58d74af2363706`; keep the local file and recorded checksum aligned in any other environment.

The live Prisma schema diff confirmed the only pending schema change was `users.users.avatar_properties`. The additive migration was deployed to Supabase and `migrate status` confirmed the history is up to date. Do not run `migrate reset` against a shared or production database.

The `20261022-add-avatar-properties` migration adds a nullable `JSONB` column; its expected change is `users.users.avatar_properties`.
