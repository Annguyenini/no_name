import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';
import { JwtSupabaseStrategy } from './jwt.strategy.js';
import { ConfigModule } from '../config/config.module.js';

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, JwtSupabaseStrategy],
  exports: [SupabaseService, JwtSupabaseStrategy],
})
export class SupabaseModule {}
