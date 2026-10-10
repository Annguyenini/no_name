import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthRepositoryService } from './auth-repository.service.js';

import { PassportModule } from '@nestjs/passport';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { UsersModule } from '../users/users.module.js';
import { SupabaseGuard } from '../supabase/supabase.guard.js';
import { JwtSupabaseStrategy } from '../supabase/jwt.strategy.js';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports:[ PassportModule,SupabaseModule,UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepositoryService,
    JwtSupabaseStrategy,
    SupabaseGuard,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
