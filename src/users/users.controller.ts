import { Body, Controller, Get, ParseUUIDPipe, Patch, Post, Query, Req, UnauthorizedException, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { SupabaseGuard } from '../supabase/supabase.guard.js';
import { UserDTO } from './dto/user.dto.js';
import type { AuthenticatedRequest } from '../core/global-types/authenticated-user.js';
import { AllExceptionsHandler } from '../interceptors/all-exceptions-handler.intercept.js';
import { CreateProfileDTO } from './dto/create-profile.dto.js';
import { UpdateDisplayNameDTO } from './dto/update-display-name.dto.js';
@Controller('users')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform:true
  }),
)
export class UsersController {
  constructor(private readonly users_service: UsersService) { }

  @UseGuards(SupabaseGuard)
  @Get('/me')
  async getMyProfile(@Req() request: AuthenticatedRequest) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.users_service.getMyProfile(request.user.id);
  }

  @UseGuards(SupabaseGuard)
  @Get('/user')
  async getUserProfile(@Query('user_id', new ParseUUIDPipe()) userId: string) {
    return this.users_service.getPublicProfile(userId);
  }

  @UseGuards(SupabaseGuard)
  @Patch('/update-display-name')
  async updateDisplayName(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateDisplayNameDTO,
  ) {
    if (!request.user?.id) throw new UnauthorizedException();
    return this.users_service.updateDisplayName(request.user.id, body.display_name);
  }

  @UseGuards(SupabaseGuard)
  @Post("/create-profile")
  @UseFilters(AllExceptionsHandler)
  async createProfile(@Req() request:AuthenticatedRequest,@Body() profile:CreateProfileDTO ) {
    if (!request.user || !request.user.id) throw new UnauthorizedException()
    const user = new UserDTO()
    user.id = request.user.id
    user.username = profile.username
    user.display_name = profile.display_name
    const created = await this.users_service.createProfile(user)
    return created
  }
}
