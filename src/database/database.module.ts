import { Module } from '@nestjs/common';
import { DatabaseController } from './database.controller.js';

@Module({
  controllers: [DatabaseController]
})
export class DatabaseModule {}
