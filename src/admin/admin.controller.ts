import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { SupabaseGuard } from '../supabase/supabase.guard.js';
import { AdminGuard } from './admin.guard.js';
import { AllExceptionsHandler } from '../interceptors/all-exceptions-handler.intercept.js';

@Controller('admin/users')
@UseGuards(SupabaseGuard, AdminGuard)
@UseFilters(AllExceptionsHandler)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AdminController {
  constructor(private readonly admin_service: AdminService) {}

  // -MIMO: Expose a UUID-validated endpoint for administrators to retrieve one user profile.
  @Get(':user_id')
  async getUser(@Param('user_id', new ParseUUIDPipe()) user_id: string) {
    return this.admin_service.getUser(user_id);
  }

  // -MIMO: Expose a UUID-validated endpoint for administrators to delete one app profile.
  @Delete(':user_id')
  async deleteUser(@Param('user_id', new ParseUUIDPipe()) user_id: string) {
    return this.admin_service.deleteUser(user_id);
  }
}
