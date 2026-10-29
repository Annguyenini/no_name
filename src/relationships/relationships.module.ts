import { Module } from '@nestjs/common';
import { RelationshipsService } from './relationships.service.js';

@Module({
  providers: [RelationshipsService]
})
export class RelationshipsModule {}
