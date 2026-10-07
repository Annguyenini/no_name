import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service.js';
import { CredentialsController } from './credentials.controller.js';

@Module({
  providers: [CredentialsService],
  controllers: [CredentialsController]
})
export class CredentialsModule {}
