import { UnauthorizedException } from '@nestjs/common';
import { RelationshipsController } from './relationships.controller.js';
import { RelationshipsService } from './relationships.service.js';

describe('RelationshipsController', () => {
  const relationships_service = { getReceivedFriendRequests: vi.fn() };
  const controller = new RelationshipsController(relationships_service as unknown as RelationshipsService);

  beforeEach(() => vi.clearAllMocks());

  // -MIMO: Verify the controller uses only the authenticated request identity for incoming friend requests.
  it('returns received requests for the verified user', async () => {
    const request_rows = [{ id1: 'sender-1', id2: 'receiver' }];
    relationships_service.getReceivedFriendRequests.mockResolvedValue(request_rows);

    await expect(controller.getReceivedFriendRequests({ user: { id: 'receiver' } } as never)).resolves.toEqual(request_rows);
    expect(relationships_service.getReceivedFriendRequests).toHaveBeenCalledWith('receiver');
  });

  it('rejects requests without an authenticated user ID', async () => {
    await expect(controller.getReceivedFriendRequests({ user: undefined } as never)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(relationships_service.getReceivedFriendRequests).not.toHaveBeenCalled();
  });
});
