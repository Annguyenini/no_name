import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UserRepositoryService } from './users.repository.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  providers: [UsersService, UserRepositoryService,PrismaService],
  exports: [UsersService,UserRepositoryService]

})
export class UsersModule {}
