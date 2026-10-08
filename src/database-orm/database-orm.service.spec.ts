import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseOrmService } from './database-orm.service.js';

describe('DatabaseOrmService', () => {
  let service: DatabaseOrmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseOrmService],
    }).compile();

    service = module.get<DatabaseOrmService>(DatabaseOrmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
