import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AdminRepositoryService } from './admin.repository.service.js';
import { UserRepositoryService } from '../users/users.repository.service.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly admin_repository: AdminRepositoryService,
    private readonly user_repository: UserRepositoryService,
  ) {}

  // -MIMO: Check persisted permissions to allow only assigned administrators into admin routes.
  async assertAdmin(user_id: string): Promise<void> {
    if (!(await this.admin_repository.isAdmin(user_id))) {
      throw new ForbiddenException('Administrator access required');
    }
  }

  // -MIMO: Reuse the shared user repository to return an admin-requested profile.
  async getUser(user_id: string) {
    const user = await this.user_repository.getUserById(user_id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // -MIMO: Remove a user's application profile for authorized administration.
  async deleteUser(user_id: string) {
    const deleted_user_id = await this.admin_repository.deleteUserById(user_id);
    if (!deleted_user_id) throw new NotFoundException('User not found');
    return { id: deleted_user_id, message: 'User profile deleted' };
  }
}
