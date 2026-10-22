# Prisma migration recovery

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

For Supabase, run `migrate dev` against a development database, then apply reviewed migrations to the shared database with `prisma migrate deploy`. Do not point `migrate dev` at the shared database. The `20261022-add-avatar-properties` migration adds a nullable `JSONB` column; its expected change is `users.users.avatar_properties`.
