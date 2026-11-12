import { Test, TestingModule } from '@nestjs/testing';
import { JwtSupabaseStrategy } from '../supabase-service/jwt.strategy.js';
import { PCPServer } from './pcp.server.js';
import { PcpGateway } from './pcp.controller.js';
import { PcpService } from './pcp.service.js';

describe('PcpGateway', () => {
  let gateway: PcpGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PcpGateway,
        { provide: JwtSupabaseStrategy, useValue: {} },
        { provide: PCPServer, useValue: {} },
        { provide: PcpService, useValue: {} },
      ],
    }).compile();

    gateway = module.get<PcpGateway>(PcpGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
