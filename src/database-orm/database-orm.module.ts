import { Module } from '@nestjs/common';
import { DatabaseOrmService } from './database-orm.service.js';

@Module({
  providers: [DatabaseOrmService]
})
export class DatabaseOrmModule {}
