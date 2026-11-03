import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';
import { JwtSupabaseStrategy } from './jwt.strategy.js';
import { ConfigModule } from '../config/config.module.js';
import { SupabaseAdminService } from './supabase.admin.service.js';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, JwtSupabaseStrategy,SupabaseAdminService],
  exports: [SupabaseService, JwtSupabaseStrategy,SupabaseAdminService],
})
export class SupabaseModule {}
