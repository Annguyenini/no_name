import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from '../../src/config/config.service.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

// -MIMO: Verify the migrated friendships table, relationship enum, constraints, and indexes.
describe('Friendships migration', () => {
  NestConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' });
  const config_service = new ConfigService();
  const prisma = new PrismaService(config_service);

  it('has the friendships schema', async () => {
    const got = await prisma.$queryRaw<Array<{ schema_name: string }>>`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = 'friendships'
    `;

    expect(got.length, 'The friendships schema does not exist').toBeGreaterThan(0);
  });

  it('has the expected friendships columns', async () => {
    const got = await prisma.$queryRaw<
      Array<{ column_name: string; data_type: string; is_nullable: string }>
    >`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'friendships' AND table_name = 'friendships'
      ORDER BY ordinal_position
    `;
    const expected = [
      { column_name: 'id1', data_type: 'uuid', is_nullable: 'NO' },
      { column_name: 'id2', data_type: 'uuid', is_nullable: 'NO' },
      { column_name: 'status', data_type: 'USER-DEFINED', is_nullable: 'NO' },
      {
        column_name: 'last_update',
        data_type: 'timestamp with time zone',
        is_nullable: 'NO',
      },
    ];

    expect(got, 'The friendships table has an unexpected number of columns').toHaveLength(expected.length);
    expect(got, 'The friendships table is missing one or more expected columns').toEqual(expect.arrayContaining(expected));
  });

  it('has the expected relationship enum labels', async () => {
    const got = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
      SELECT e.enumlabel
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE n.nspname = 'friendships' AND t.typname = 'relationship'
      ORDER BY e.enumsortorder
    `;

    expect(got.map(({ enumlabel }) => enumlabel), 'The friendships relationship enum labels do not match the migration').toEqual([
      'friend',
      'request_from_1',
      'request_from_2',
      'block_from_1',
      'block_from_2',
    ]);
  });

  it('has the expected primary key and user foreign keys', async () => {
    const got = await prisma.$queryRaw<
      Array<{ constraint_name: string; constraint_type: string }>
    >`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'friendships' AND table_name = 'friendships'
    `;
    const expected = [
      {
        constraint_name: 'friendships_pkey',
        constraint_type: 'PRIMARY KEY',
      },
      {
        constraint_name: 'friendships_id1_fkey',
        constraint_type: 'FOREIGN KEY',
      },
      {
        constraint_name: 'friendships_id2_fkey',
        constraint_type: 'FOREIGN KEY',
      },
    ];

    expect(got, 'The friendships table is missing its primary key or user foreign keys').toEqual(expect.arrayContaining(expected));
  });

  it('has the status lookup indexes for both users', async () => {
    const got = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'friendships' AND tablename = 'friendships'
    `;

    expect(got.map(({ indexname }) => indexname), 'The friendships status lookup indexes are missing').toEqual(
      expect.arrayContaining(['idx_user_1_status', 'idx_user_2_status']),
    );
  });
});
