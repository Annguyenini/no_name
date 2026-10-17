import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import type { AuthenticatedRequest } from '../core/global-types/authenticated-user.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly admin_service: AdminService) {}

  // -MIMO: Require a verified user and an admin permission for protected admin endpoints.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user?.id) return false;
    await this.admin_service.assertAdmin(request.user.id);
    return true;
  }
}
