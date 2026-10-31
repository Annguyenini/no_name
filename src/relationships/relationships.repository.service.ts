import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace.js';
import { relationship } from '../generated/prisma/enums.js';
import { DatabaseException } from '../core/exceptions/app-exceptions.js';
import { request } from 'express';
interface OneToOneRelationship {
  user_id: string
  target_user_id: string
  status:relationship
}

interface OneToManyRelationship {
  user_1: string
  user_2: string
  user_1_status: relationship
  user_2_status:relationship
}

@Injectable()
export class RelationshipsRepositoryService {
  constructor(private readonly prisma : PrismaService){}
  async getUserRelationships(relation:OneToManyRelationship) {
    try {
      const request = await this.prisma.friendships.findMany({
        where: {
          OR: [
            {
              AND: [
                { id1: relation.user_1 },
                { status: relation.user_1_status },
              ],
            },
            {
              AND: [
                { id2: relation.user_1 },
                { status: relation.user_2_status },
              ],
            },
          ],
        },
        orderBy: { last_update: 'desc' },
      });
      return request
    }
    catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new DatabaseException(
          'Relationship repository',
          `Failed to get received friend requests: ${err}`,
          'Failed to get received friend requests',
          500,
        );
      }
      throw err;
    }  }
  _softUserIds(user_1:string, user_2: string) {
    return  user_1<=user_2 ? [user_1,user_2] : [user_2,user_1]
  }
  async getUserFriendList(user_id: string) {
    const status = relationship.friend;

    return this.getUserRelationships({
      user_1: user_id,
      user_2: user_id,
      user_1_status: relationship.friend,
      user_2_status: relationship.friend
    })
  }
  async getReceivedFriendRequests(user_id: string) {
    const user_1_status = relationship.request_from_2;
    const user_2_status = relationship.request_from_1;
    return this.getUserRelationships({
      user_1: user_id,
      user_2: user_id,
      user_1_status: user_1_status,
      user_2_status: user_2_status
    })
  }
  async getSendFriendRequests(user_id: string) {
    const user_1_status = relationship.request_from_1;
    const user_2_status = relationship.request_from_2;
    return this.getUserRelationships({
      user_1: user_id,
      user_2: user_id,
      user_1_status: user_1_status,
      user_2_status: user_2_status
    })
  }
  async sendFriendRequest(user_id: string,target_user_id:string) {
    const [user_1,user_2] = this._softUserIds(user_id, target_user_id)
    try {
      const request = await this.prisma.friendships.upsert({

      })
    }
    catch (err) {

    }
  }
}
