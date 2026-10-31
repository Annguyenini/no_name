import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service.js';
import { ConfigService } from '../config/config.service.js';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseService,
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
// -MIMO: Stub configuration to satisfy SupabaseService construction without reading environment configuration.
