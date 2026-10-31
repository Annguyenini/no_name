import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RelationshipsService } from './relationships.service.js';
import { SupabaseGuard } from '../supabase-service/supabase.guard.js';
import { AllExceptionsHandler } from '../interceptors/all-exceptions-handler.intercept.js';
import type { AuthenticatedRequest } from '../core/global-types/authenticated-user.js';

@Controller('relationships')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
@UseFilters(AllExceptionsHandler)
// -MIMO: Expose relationship request reads through an authenticated controller with standard validation and exception handling.
export class RelationshipsController {
  constructor(private readonly relationships_service: RelationshipsService) {}

  // -MIMO: Return incoming requests for the verified user without accepting another user's ID from the client.
  @UseGuards(SupabaseGuard)
  @Get('friend-requests/received')
  async getReceivedFriendRequests(@Req() request: AuthenticatedRequest) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.relationships_service.getReceivedFriendRequests(request.user.id);
  }
}
