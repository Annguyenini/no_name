import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
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
  @Get('friends')
  async getFriendList(@Req() request: AuthenticatedRequest) {
    if (!request.user?.id) throw new UnauthorizedException();
    return await this.relationships_service.getUserFriendList(request.user.id);
  }
  @UseGuards(SupabaseGuard)
  @Get('send-friend-requests')
  async getSendFriendRequests(@Req() request: AuthenticatedRequest) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.relationships_service.getSendFriendRequests(request.user.id);
  }
  @UseGuards(SupabaseGuard)
  @Get('received-friend-requests')
  async getReceivedFriendRequests(@Req() request: AuthenticatedRequest) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.relationships_service.getReceivedFriendRequests(request.user.id);
  }

  // -MIMO: Route authenticated friend-request creation through the relationship service.
  @UseGuards(SupabaseGuard)
  @Post('friend-requests/:target_user_id')
  async sendFriendRequest(
    @Req() request: AuthenticatedRequest,
    @Param('target_user_id', new ParseUUIDPipe()) target_user_id: string,
  ) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.relationships_service.sendFriendRequest(request.user.id, target_user_id);
  }

  // -MIMO: Route accepting an incoming request through the authenticated user's identity.
  @UseGuards(SupabaseGuard)
  @Post('friend-requests/received/:target_user_id/accept')
  async acceptFriendRequest(
    @Req() request: AuthenticatedRequest,
    @Param('target_user_id', new ParseUUIDPipe()) target_user_id: string,
  ) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.relationships_service.acceptFriendRequest(request.user.id, target_user_id);
  }

  // -MIMO: Route rejecting an incoming request through the authenticated user's identity.
  @UseGuards(SupabaseGuard)
  @Delete('friend-requests/received/:target_user_id')
  async rejectFriendRequest(
    @Req() request: AuthenticatedRequest,
    @Param('target_user_id', new ParseUUIDPipe()) target_user_id: string,
  ) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.relationships_service.rejectFriendRequest(request.user.id, target_user_id);
  }

  // -MIMO: Route canceling an outgoing request through the authenticated user's identity.
  @UseGuards(SupabaseGuard)
  @Delete('friend-requests/sent/:target_user_id')
  async cancelFriendRequest(
    @Req() request: AuthenticatedRequest,
    @Param('target_user_id', new ParseUUIDPipe()) target_user_id: string,
  ) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.relationships_service.cancelFriendRequest(request.user.id, target_user_id);
  }

  // -MIMO: Route removing an existing friendship through the authenticated user's identity.
  @UseGuards(SupabaseGuard)
  @Delete('friends/:target_user_id')
  async deleteAFriend(
    @Req() request: AuthenticatedRequest,
    @Param('target_user_id', new ParseUUIDPipe()) target_user_id: string,
  ) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.relationships_service.deleteAFriend(request.user.id, target_user_id);
  }


}
