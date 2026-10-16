import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service.js';

describe('AdminService', () => {
  const admin_repository = {
    isAdmin: vi.fn(),
    deleteUserById: vi.fn(),
  };
  const user_repository = { getUserById: vi.fn() };
  let service: AdminService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminService(admin_repository as never, user_repository as never);
  });

  it('allows only persisted admins', async () => {
    admin_repository.isAdmin.mockResolvedValueOnce(false);
    await expect(service.assertAdmin('user-id')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns a user profile', async () => {
    const user = { id: 'user-id', username: 'sample' };
    user_repository.getUserById.mockResolvedValueOnce(user);
    await expect(service.getUser('user-id')).resolves.toBe(user);
  });

  it('reports a missing user on lookup and delete', async () => {
    user_repository.getUserById.mockResolvedValueOnce(null);
    admin_repository.deleteUserById.mockResolvedValueOnce(null);
    await expect(service.getUser('user-id')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.deleteUser('user-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns a confirmation after deleting the profile', async () => {
    admin_repository.deleteUserById.mockResolvedValueOnce('user-id');
    await expect(service.deleteUser('user-id')).resolves.toEqual({
      id: 'user-id',
      message: 'User profile deleted',
    });
  });
});
