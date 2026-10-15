import { Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { SupabaseGuard } from '../supabase/supabase.guard.js';
import { UserDTO } from './dto/user.dto.js';
import type { AuthenticatedRequest } from '../core/global-types/authenticated-user.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users_service: UsersService) { }

  @UseGuards(SupabaseGuard)
  @Post("/users/create-profile")
  async createProfile(@Req() request:AuthenticatedRequest,user:UserDTO ) {
    if(!request.user || !request.user.id) throw new UnauthorizedException()
    user.id = request.user.id
    const created=  await this.users_service.createProfile(user)

  }
}
