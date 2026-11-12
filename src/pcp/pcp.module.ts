import { Module } from '@nestjs/common';
import { PcpGateway } from './pcp.controller.js';
import { JwtSupabaseStrategy } from '../supabase-service/jwt.strategy.js';
import { SupabaseModule } from '../supabase-service/supabase.module.js';
import { PcpService } from './pcp.service.js';
import { PCPServer } from './pcp.server.js';

@Module({
  providers: [PcpGateway, PcpService,PCPServer],
  imports:[SupabaseModule]

})
export class PcpModule {}
