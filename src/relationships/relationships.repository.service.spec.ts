import { Test, TestingModule } from '@nestjs/testing';
import { RelationshipsRepositoryService } from './relationships.repository.service.js';

describe('RelationshipsRepositoryService', () => {
  let service: RelationshipsRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelationshipsRepositoryService],
    }).compile();

    service = module.get<RelationshipsRepositoryService>(RelationshipsRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
