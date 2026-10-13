import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '../config/config.service.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    const { DATABASE_URL } = configService.getDatabaseConfig();
    const adapter = new PrismaPg({ connectionString: DATABASE_URL });
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

}
