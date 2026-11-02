import { Injectable } from '@nestjs/common';
import { OneToOneRelationship, RelationshipsRepositoryService } from './relationships.repository.service.js';
import { relationship } from '../generated/prisma/enums.js';

@Injectable()
// -MIMO: Keep request validation at the controller boundary; service methods are called directly by application code.
export class RelationshipsService {
  constructor(private readonly relationships_repository: RelationshipsRepositoryService) {}
  _softUserIds(user_1:string, user_2: string) {
    return  user_1<=user_2 ? [user_1,user_2] : [user_2,user_1]
  }
  _oneToOneObject(user_id: string, target_user_id: string,status:relationship) {
    const [user_1,user_2] = this._softUserIds(user_id, target_user_id)
    // update relationship to friend
    const rel_obj: OneToOneRelationship = {
      user_1: user_1,
      user_2: user_2,
      status:status,
      last_update: new Date(),
    }
    return rel_obj
  }
  async getUserFriendList(user_id: string) {
    return this.relationships_repository.getUserRelationships({
      user_1: user_id,
      user_2: user_id,
      user_1_status: relationship.friend,
      user_2_status: relationship.friend
    })
  }
  async getReceivedFriendRequests(user_id: string) {
    const user_1_status = relationship.request_from_2;
    const user_2_status = relationship.request_from_1;
    return this.relationships_repository.getUserRelationships({
      user_1: user_id,
      user_2: user_id,
      user_1_status: user_1_status,
      user_2_status: user_2_status
    })
  }
  async getSendFriendRequests(user_id: string) {
    const user_1_status = relationship.request_from_1;
    const user_2_status = relationship.request_from_2;
    return this.relationships_repository.getUserRelationships({
      user_1: user_id,
      user_2: user_id,
      user_1_status: user_1_status,
      user_2_status: user_2_status
    })
  }
  async sendFriendRequest(user_id: string, target_user_id: string) {
    // sort the user ids
    const [user_1, user_2] = this._softUserIds(user_id, target_user_id)
    let status

    if (user_id === user_1) status = relationship.request_from_1
      else status =  relationship.request_from_2

    const rel_obj: OneToOneRelationship = {
      user_1: user_1,
      user_2: user_2,
      status: status,
      last_update: new Date(),
    }
    // add into database
    return this.relationships_repository.addOrUpdateRelationship(rel_obj);
  }
  async deleteAFriend(user_id:string, target_user_id:string ) {
    const rel_obj = this._oneToOneObject(user_id, target_user_id,relationship.friend)
    // delete it
    const delete_rel = this.relationships_repository.deleteRelationship(rel_obj)
    return delete_rel
  }
  async acceptFriendRequest(user_id: string, target_user_id: string) {
    const rel_obj = this._oneToOneObject(user_id, target_user_id,relationship.friend)

    return this.relationships_repository.addOrUpdateRelationship(rel_obj)
  }

  async rejectFriendRequest(user_id:string, target_user_id:string ) {
    const rel_obj = this._oneToOneObject(user_id, target_user_id,relationship.friend)

    // delete it
    const delete_rel = this.relationships_repository.deleteRelationship(rel_obj)
    return delete_rel
  }

  async cancelFriendRequest(user_id:string, target_user_id:string ) {
    const rel_obj = this._oneToOneObject(user_id, target_user_id,relationship.friend)

    // delete it
    const delete_rel = this.relationships_repository.deleteRelationship(rel_obj)
    return delete_rel
  }
}
