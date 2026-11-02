import { UnauthorizedException } from '@nestjs/common';
import { RelationshipsController } from './relationships.controller.js';
import { RelationshipsService } from './relationships.service.js';
import type { AuthenticatedRequest } from '../../core/global-types/authenticated-user.js';

describe('RelationshipsController', () => {
  const relationships_service = {
    getUserFriendList: vi.fn(),
    getSendFriendRequests: vi.fn(),
    getReceivedFriendRequests: vi.fn(),
    sendFriendRequest: vi.fn(),
    acceptFriendRequest: vi.fn(),
    rejectFriendRequest: vi.fn(),
    cancelFriendRequest: vi.fn(),
    deleteAFriend: vi.fn(),
  };
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

  // -MIMO: Verify friend actions always pass the authenticated user and validated target ID to the service.
  it('routes authenticated friend actions to the matching service methods', async () => {
    const request = { user: { id: '11111111-1111-4111-8111-111111111111' } } as AuthenticatedRequest;
    const target_user_id = '22222222-2222-4222-8222-222222222222';

    await controller.getFriendList(request);
    expect(relationships_service.getUserFriendList).toHaveBeenCalledWith(request.user.id);

    await controller.getSendFriendRequests(request);
    expect(relationships_service.getSendFriendRequests).toHaveBeenCalledWith(request.user.id);

    await controller.sendFriendRequest(request, target_user_id);
    expect(relationships_service.sendFriendRequest).toHaveBeenCalledWith(request.user.id, target_user_id);

    await controller.acceptFriendRequest(request, target_user_id);
    expect(relationships_service.acceptFriendRequest).toHaveBeenCalledWith(request.user.id, target_user_id);

    await controller.rejectFriendRequest(request, target_user_id);
    expect(relationships_service.rejectFriendRequest).toHaveBeenCalledWith(request.user.id, target_user_id);

    await controller.cancelFriendRequest(request, target_user_id);
    expect(relationships_service.cancelFriendRequest).toHaveBeenCalledWith(request.user.id, target_user_id);

    await controller.deleteAFriend(request, target_user_id);
    expect(relationships_service.deleteAFriend).toHaveBeenCalledWith(request.user.id, target_user_id);
  });
});
