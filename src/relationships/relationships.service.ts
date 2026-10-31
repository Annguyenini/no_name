import { Injectable } from '@nestjs/common';
import { RelationshipsRepositoryService } from './relationships.repository.service.js';

@Injectable()
export class RelationshipsService {
  constructor(private readonly relationships_repository: RelationshipsRepositoryService) {}

  // -MIMO: Delegate the authenticated user's received friend request lookup to the relationship repository.
  async getReceivedFriendRequests(user_id: string) {
    return this.relationships_repository.getReceivedFriendRequests(user_id);
  }
}
