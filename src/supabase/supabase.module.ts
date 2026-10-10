import { Module } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service.js';
import { JwtSupabaseStrategy } from './jwt.strategy.js';
@Module({
  providers: [SupabaseService,JwtSupabaseStrategy],

  exports:[SupabaseService,JwtSupabaseStrategy]
})
export class SupabaseModule { }
