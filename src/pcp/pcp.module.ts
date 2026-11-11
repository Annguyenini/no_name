import { Module } from '@nestjs/common';
import { PcpGateway } from './pcp.controller.js';
import { JwtSupabaseStrategy } from '../supabase-service/jwt.strategy.js';
import { SupabaseModule } from '../supabase-service/supabase.module.js';

@Module({
  providers: [PcpGateway],
  imports:[SupabaseModule]

})
export class PcpModule {}
