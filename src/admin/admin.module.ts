import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminRepositoryService } from './admin.repository.service.js';
import { AdminGuard } from './admin.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigModule } from '../config/config.module.js';
import { SupabaseModule } from '../supabase-service/supabase.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [ConfigModule, SupabaseModule, UsersModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepositoryService, AdminGuard, PrismaService],
})
// -MIMO: Register the admin controller, persisted permission guard, service, and repository.
export class AdminModule {}
