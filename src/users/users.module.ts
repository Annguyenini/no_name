import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UserRepositoryService } from './users.repository.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigModule } from '../config/config.module.js';
import { UsersController } from './users.controller.js';
import { ContentsModule } from '../contents/contents.module.js';

@Module({
  imports: [ConfigModule,ContentsModule],
  providers: [UsersService, UserRepositoryService,PrismaService],
  exports: [UsersService,UserRepositoryService],
  controllers: [UsersController]

})
export class UsersModule {}
