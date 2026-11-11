import { Module } from '@nestjs/common';
import { PcpGateway } from './pcp.controller.js';

@Module({
  providers:[PcpGateway]
})
export class PcpModule {}
