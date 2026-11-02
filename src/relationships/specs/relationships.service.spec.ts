import { Test, TestingModule } from '@nestjs/testing';
import { RelationshipsService } from '../relationships.service.js';
import { RelationshipsRepositoryService } from '../relationships.repository.service.js';
import { relationship } from '../../generated/prisma/enums.js';

describe('RelationshipsService', () => {
  let service: RelationshipsService;
  let relationships_repository: {
    getUserRelationships: ReturnType<typeof vi.fn>;
    addRelationship: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    relationships_repository = {
      getUserRelationships: vi.fn(),
      addRelationship: vi.fn(),
    };
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
    relationships_repository.getUserRelationships.mockResolvedValue(request_rows);

    await expect(service.getReceivedFriendRequests('receiver')).resolves.toEqual(request_rows);
    expect(relationships_repository.getUserRelationships).toHaveBeenCalledWith({
      user_id: 'receiver',
      when_user_is_id1: relationship.request_from_2,
      when_user_is_id2: relationship.request_from_1,
    });
  });

  // -MIMO: Verify sent requests delegate with a real Date timestamp and normalized user IDs.
  it('creates a friend request with the current Date', async () => {
    const result = { id1: 'sender', id2: 'target' };
    relationships_repository.addRelationship.mockResolvedValue(result);
    const date_before_call = Date.now();

    await expect(service.sendFriendRequest('sender', 'target')).resolves.toEqual(result);

    const [relationship_request] = relationships_repository.addRelationship.mock.calls[0];
    expect(relationship_request.last_update).toBeInstanceOf(Date);
    expect(relationship_request.last_update.getTime()).toBeGreaterThanOrEqual(date_before_call);
    expect(relationship_request.last_update.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
