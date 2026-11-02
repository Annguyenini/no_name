import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace.js';
import { relationship } from '../generated/prisma/enums.js';
import { DatabaseException } from '../core/exceptions/app-exceptions.js';
export interface OneToOneRelationship {
  user_1: string
  user_2: string
  status: relationship
  last_update?: Date
}
export interface UpdateRelationshipStatus extends OneToOneRelationship{
  new_status:relationship
}
// -MIMO: Describe the one user being queried and each status used for the pair's canonical row direction.
export interface RelationshipListQuery {
  user_id: string
  when_user_is_id1: relationship
  when_user_is_id2: relationship
}

@Injectable()
export class RelationshipsRepositoryService {
  constructor(private readonly prisma : PrismaService){}
  async getUserRelationships(relation: RelationshipListQuery) {
    try {
      const request = await this.prisma.friendships.findMany({
        where: {
          OR: [
            {
              AND: [
                { id1: relation.user_id },
                { status: relation.when_user_is_id1 },
              ],
            },
            {
              AND: [
                { id2: relation.user_id },
                { status: relation.when_user_is_id2 },
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
  async getOneToOneRelationship(relationship: OneToOneRelationship) {
    try {
      const result = await this.prisma.friendships.findFirstOrThrow({
        where: {
          AND: [
            { id1: relationship.user_1 },
            { id2:relationship.user_2 }
          ]
        }
      })
      return result
    }
    catch (err) {
      if (err instanceof (PrismaClientKnownRequestError) && err.code === "P2025") {
        throw new BadRequestException('Relationship not exists')
      }
      throw err
    }
  }
  async addRelationship(relationship:OneToOneRelationship) {
    try {
      const request = await this.prisma.friendships.create({
        data: {
          id1: relationship.user_1,
          id2: relationship.user_2,
          status: relationship.status,
          last_update:relationship.last_update
        }
      })
      return request
    }
    catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') throw new BadRequestException('Relationship already exists');
        // -MIMO: Report a missing target user as a client-visible not-found response instead of a database failure.
        if (err.code === 'P2003') throw new NotFoundException('Target user does not exist');
        throw new DatabaseException('Relationship', `Failed to add relationship: ${err}`, 'Failed to add relationship', 500);
      }
      throw err;
    }
  }
  async updateRelationship(relationship: UpdateRelationshipStatus) {
    try {
      const result = await this.prisma.friendships.updateMany({
        where: {
          id1: relationship.user_1,
          id2: relationship.user_2,
          status:relationship.status
        },
        data: {
          status: relationship.new_status,
          last_update:relationship.last_update
        }
      })
      if (result.count !== 1) throw new BadRequestException('No incoming request in the expected state');
      return result
    }
    catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        throw new DatabaseException('Relationship', `Failed to update relationship: ${err}`, 'Failed to update relationship', 500);
      }
      throw err;

    }
  }
  async deleteRelationship(relationship: OneToOneRelationship) {
    try {
      const result = await this.prisma.friendships.deleteMany({
        where: {
          id1: relationship.user_1,
          id2: relationship.user_2,
          status: relationship.status,
        },
      });

      if (result.count !== 1) {
        throw new BadRequestException('Relationship not found in the expected status');
      }
      return result
    }
    catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new NotFoundException("Relationship not exists")
        }
        throw new DatabaseException("Relationship", `Failed to delete user relationship: ${err}`, 'Failed to delete user relationship', 500)
      }
      throw err
    }
  }
}
