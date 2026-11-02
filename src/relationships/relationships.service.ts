import { BadRequestException, Injectable } from '@nestjs/common';
import { OneToOneRelationship, RelationshipsRepositoryService, UpdateRelationshipStatus } from './relationships.repository.service.js';
import { relationship } from '../generated/prisma/enums.js';

@Injectable()
// -MIMO: Keep request validation at the controller boundary; service methods are called directly by application code.
export class RelationshipsService {
  constructor(private readonly relationships_repository: RelationshipsRepositoryService) {}
  _softUserIds(user_1: string, user_2: string) {
    if (user_1 === user_2) throw new BadRequestException("Cant self select")
    return  user_1<user_2 ? [user_1,user_2] : [user_2,user_1]
  }

  // -MIMO: Pass one queried user and status values for both canonical pair positions to the repository.
  async getUserFriendList(user_id: string) {
    return this.relationships_repository.getUserRelationships({
      user_id,
      when_user_is_id1: relationship.friend,
      when_user_is_id2: relationship.friend,
    })
  }
  async getReceivedFriendRequests(user_id: string) {
    const user_1_status = relationship.request_from_2;
    const user_2_status = relationship.request_from_1;
    return this.relationships_repository.getUserRelationships({
      user_id,
      when_user_is_id1: user_1_status,
      when_user_is_id2: user_2_status,
    })
  }
  async getSendFriendRequests(user_id: string) {
    const user_1_status = relationship.request_from_1;
    const user_2_status = relationship.request_from_2;
    return this.relationships_repository.getUserRelationships({
      user_id,
      when_user_is_id1: user_1_status,
      when_user_is_id2: user_2_status,
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
    return this.relationships_repository.addRelationship(rel_obj);
  }
  async deleteAFriend(user_id:string, target_user_id:string ) {
    const [user_1,user_2] = this._softUserIds(user_id, target_user_id)
    const rel_obj: OneToOneRelationship = {
      user_1: user_1,
      user_2: user_2,
      status: relationship.friend,
      last_update:new Date()
    }
    const delete_rel = this.relationships_repository.deleteRelationship(rel_obj)
    return delete_rel
  }
  async acceptFriendRequest(user_id: string, target_user_id: string) {
    const [user_1,user_2] = this._softUserIds(user_id, target_user_id)
    // get existing relationship
    let expected_status
    // set expected relationship, if user is user_1, the request must came from user_2
    if (user_id === user_1) {
      expected_status = relationship.request_from_2
    }
    else{
      expected_status = relationship.request_from_1
    }
    const rel_obj: UpdateRelationshipStatus = {
      user_1: user_1,
      user_2: user_2,
      status: expected_status,
      new_status: relationship.friend,
      last_update:new Date()
    }
    return this.relationships_repository.updateRelationship(rel_obj)
  }

  async rejectFriendRequest(user_id:string, target_user_id:string ) {
    const [user_1,user_2] = this._softUserIds(user_id, target_user_id)
    // get existing relationship
    let expected_status
    // set expected relationship, if user is user_1, the request must came from user_2
    if (user_id === user_1) {
      expected_status = relationship.request_from_2
    }
    else{
      expected_status = relationship.request_from_1
    }
    const rel_obj: OneToOneRelationship = {
      user_1: user_1,
      user_2: user_2,
      status: expected_status,
      last_update:new Date()
    }
    const delete_rel = this.relationships_repository.deleteRelationship(rel_obj)
    return delete_rel
  }

  async cancelFriendRequest(user_id:string, target_user_id:string ) {
    const [user_1,user_2] = this._softUserIds(user_id, target_user_id)
    // get existing relationship
    let expected_status
    // set expected relationship, if user is user_1, the request must came from user_2
    if (user_id === user_1) {
      expected_status = relationship.request_from_1
    }
    else{
      expected_status = relationship.request_from_2
    }
    const rel_obj: OneToOneRelationship = {
      user_1: user_1,
      user_2: user_2,
      status: expected_status,
      last_update:new Date()
    }
    const delete_rel = this.relationships_repository.deleteRelationship(rel_obj)
    return delete_rel
  }
}
