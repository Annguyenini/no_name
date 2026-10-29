import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from '../../src/config/config.service.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

// -MIMO: Verify the migrated permission table, role enum, and foreign-key constraints.
describe('Permission migration', () => {
  NestConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' });
  const config_service = new ConfigService();
  const prisma = new PrismaService(config_service);

  it('has the permission schema', async () => {
    const got = await prisma.$queryRaw<Array<{ schema_name: string }>>`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = 'permission'
    `;

    expect(got.length, 'The permission schema does not exist').toBeGreaterThan(0);
  });

  it('has the expected permission columns', async () => {
    const got = await prisma.$queryRaw<
      Array<{ column_name: string; data_type: string; is_nullable: string }>
    >`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'permission' AND table_name = 'permission'
      ORDER BY ordinal_position
    `;
    const expected = [
      { column_name: 'id', data_type: 'uuid', is_nullable: 'NO' },
      { column_name: 'role', data_type: 'USER-DEFINED', is_nullable: 'YES' },
      {
        column_name: 'last_update',
        data_type: 'timestamp with time zone',
        is_nullable: 'NO',
      },
    ];

    expect(got, 'The permission table has an unexpected number of columns').toHaveLength(expected.length);
    expect(got, 'The permission table is missing one or more expected columns').toEqual(expect.arrayContaining(expected));
  });

  it('has the expected role enum labels', async () => {
    const got = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE n.nspname = 'permission' AND t.typname = 'role'
      ORDER BY e.enumsortorder
    `;

    expect(got.map(({ enumlabel }) => enumlabel), 'The permission role enum labels do not match the migration').toEqual(['admin', 'user']);
  });

  it('has the expected primary key and foreign key', async () => {
    const got = await prisma.$queryRaw<
      Array<{ constraint_name: string; constraint_type: string }>
    >`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'permission' AND table_name = 'permission'
    `;
    const expected = [
      { constraint_name: 'permission_pkey', constraint_type: 'PRIMARY KEY' },
      {
        constraint_name: 'permission_id_fkey',
        constraint_type: 'FOREIGN KEY',
      },
    ];

    expect(got, 'The permission table is missing its primary key or user foreign key').toEqual(expect.arrayContaining(expected));
  });
});
