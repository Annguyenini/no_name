import { ConfigService } from "../../src/config/config.service.js"
import { PrismaService } from "../../src/prisma/prisma.service.js"
import { ConfigModule as NestConfigModule } from '@nestjs/config';

describe("Test migration", () => {
  NestConfigModule.forRoot({
    isGlobal: true,
    envFilePath:'.env',
  })
  const config_service = new ConfigService()
  const prisma = new PrismaService(config_service)
  describe("users table, and user constraints", () => {
    it("get schema", async() => {
      const got:{'schema_name':string}[] = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'users';`
      expect(got.length, 'The users schema does not exist').toBeGreaterThan(0)
    })
    it("It should check if users table is up to date", async () => {
      const return_columns = await prisma.$queryRaw
        <Array<{ column_name: string, data_type: string, is_nullable: string }>>`SELECT column_name, data_type,is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'users'
        AND table_name ='users'
        ORDER BY ordinal_position`
      const expected_columns = [
        {
          column_name: 'id',
          data_type: 'uuid',
          is_nullable: 'NO',
        },
        {
          column_name: 'username',
          data_type: 'text',
          is_nullable: 'NO',
        },
        {
          column_name: 'display_name',
          data_type: 'text',
          is_nullable: 'NO',
        },
        {
          column_name: 'status',
          data_type: 'USER-DEFINED',
          is_nullable: 'NO',
        },
        {
          column_name: 'avatar_properties',
          data_type: 'jsonb',
          is_nullable: 'YES',
        },
        {
          column_name: 'avatar_id',
          data_type: 'text',
          is_nullable: 'YES',
        }
      ]
      expect(return_columns.length, 'The users table has an unexpected number of columns').toBe(expected_columns.length)
      expect(return_columns, 'The users table is missing one or more expected columns').toEqual(expect.arrayContaining(expected_columns))
    })
    it("Checking for status enum", async () => {
      const got = await prisma.$queryRaw<Array<{ enumlabel: string }>>
        `SELECT e.enumlabel
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname = 'users'
        AND t.typname = 'status'
        ORDER BY e.enumsortorder`;
      expect(
        got.map((e) => e.enumlabel),
        'The users status enum labels do not match the migration',
      ).toEqual(['active', 'ban', 'deactivate'])
    })
    it("Checking for constraints", async() => {
      const got = await prisma.$queryRaw<Array<{ 'constraint_name': string, 'return_columns': string }>>`SELECT
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'users'
        AND table_name = 'users'
      ORDER BY constraint_name;`
      const expected=[{ constraint_name: 'users_id_fkey', constraint_type: 'FOREIGN KEY' },
        { constraint_name: 'users_pkey', constraint_type: 'PRIMARY KEY' }]
      expect(got, 'The users table is missing its primary key or Auth foreign key').toEqual(expect.arrayContaining(expected))

    })

  })
})
