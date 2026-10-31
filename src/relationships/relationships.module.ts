import { Module } from '@nestjs/common';
import { RelationshipsService } from './relationships.service.js';
import { RelationshipsRepositoryService } from './relationships.repository.service.js';
import { RelationshipsController } from './relationships.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigModule } from '../config/config.module.js';
import { SupabaseModule } from '../supabase-service/supabase.module.js';

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [RelationshipsController],
  providers: [RelationshipsService, RelationshipsRepositoryService, PrismaService],
  exports: [RelationshipsService, RelationshipsRepositoryService],
})
// -MIMO: Register the protected relationships API with its service, repository, and Prisma dependencies.
export class RelationshipsModule {}
