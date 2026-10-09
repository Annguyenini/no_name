import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthRepositoryService } from './auth-repository.service.js';

import { PassportModule } from '@nestjs/passport';
import { JwtSupabaseStrategy } from './jwt.strategy.js';

@Module({
  imports:[ PassportModule.register({ defaultStrategy: 'jwt' }),],
  controllers: [AuthController],
  providers: [AuthService, JwtSupabaseStrategy,AuthRepositoryService],
  exports: [PassportModule],
})
export class AuthModule {}
