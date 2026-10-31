import { Test, TestingModule } from '@nestjs/testing';
import { RelationshipsService } from './relationships.service.js';
import { RelationshipsRepositoryService } from './relationships.repository.service.js';

describe('RelationshipsService', () => {
  let service: RelationshipsService;
  let relationships_repository: { getReceivedFriendRequests: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    relationships_repository = { getReceivedFriendRequests: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelationshipsService, { provide: RelationshipsRepositoryService, useValue: relationships_repository }],
    }).compile();

    service = module.get<RelationshipsService>(RelationshipsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -MIMO: Verify the domain service delegates received-request reads using the authenticated user's ID.
  it('delegates received request lookup to the repository', async () => {
    const request_rows = [{ id1: 'sender-1', id2: 'receiver' }];
    relationships_repository.getReceivedFriendRequests.mockResolvedValue(request_rows);

    await expect(service.getReceivedFriendRequests('receiver')).resolves.toEqual(request_rows);
    expect(relationships_repository.getReceivedFriendRequests).toHaveBeenCalledWith('receiver');
  });
});
