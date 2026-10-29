import { readFileSync } from 'node:fs';
import prisma_config, {
  supabase_auth_external_enums,
  supabase_auth_external_tables,
} from '../prisma.config.js';
import { describe, expect, it } from 'vitest';

// -MIMO: Verify the Prisma migration config excludes all Supabase Auth-owned objects from migration management.
const prisma_schema_text = readFileSync(
  new URL('./schema.prisma', import.meta.url),
  'utf8',
);

describe('Prisma migration ownership config', () => {
  it('marks every Auth model and enum as externally managed', () => {
    const auth_table_names = [
      ...prisma_schema_text.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm),
    ]
      .filter(([, , model_body]) => model_body.includes('@@schema("auth")'))
      .map(([_, model_name, model_body]) => {
        const mapped_name =
          model_body.match(/@@map\("([^"]+)"\)/)?.[1] ?? model_name;
        return `auth.${mapped_name}`;
      })
      .sort();
    const auth_enum_names = [
      ...prisma_schema_text.matchAll(/^enum\s+(\w+)\s*\{([\s\S]*?)^\}/gm),
    ]
      .filter(([, , enum_body]) => enum_body.includes('@@schema("auth")'))
      .map(([, enum_name]) => `auth.${enum_name}`)
      .sort();

    expect(prisma_config.experimental?.externalTables).toBe(true);
    expect([...supabase_auth_external_tables].sort()).toEqual(auth_table_names);
    expect([...supabase_auth_external_enums].sort()).toEqual(auth_enum_names);
    expect(supabase_auth_external_tables).not.toContain('users.users');
    expect(supabase_auth_external_tables).not.toContain(
      'permission.permission',
    );
    expect(supabase_auth_external_tables).not.toContain(
      'friendships.friendships',
    );
    expect(prisma_config.migrations?.initShadowDb).toContain(
      'CREATE TABLE IF NOT EXISTS "auth"."users"',
    );
  });

  // -MIMO: Keep Supabase-owned Auth DDL out of the new project's app baseline.
  it('uses Auth only as an external foreign-key target in the fresh app baseline', () => {
    const baseline_sql = readFileSync(
      new URL('./migrations/0_init_supabase/migration.sql', import.meta.url),
      'utf8',
    );

    expect(baseline_sql).not.toMatch(/CREATE SCHEMA IF NOT EXISTS "auth"/);
    expect(baseline_sql).not.toMatch(/CREATE TYPE "auth"\./);
    expect(baseline_sql).not.toMatch(/CREATE TABLE "auth"\./);
    expect(baseline_sql).toContain('REFERENCES "auth"."users"("id")');
  });
});
