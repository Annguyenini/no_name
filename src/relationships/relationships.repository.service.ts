import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace.js';
import { DatabaseException } from '../core/exceptions/app-exceptions.js';

@Injectable()
export class RelationshipsRepositoryService {
  constructor(private readonly prisma : PrismaService){}
  async getUserFriendList(user_id: string) {
    try {
      const friend_list = await this.prisma.friendships.findMany({
        where: {
          OR: [
            { id1: user_id },
            { id2: user_id }
          ]
        }
      })
      return friend_list
    }
    catch (err) {
      if (err instanceof (PrismaClientKnownRequestError)) {
        throw new DatabaseException("Relationship repository",`Failed to get friends: ${err}`,"Failed to get friends",500)
      }
      throw err
    }
  }
  async getReceivedFriendRequests(user_id:string) {
    try{

    }
    catch (err) {

    }
  }

}
