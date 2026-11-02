import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError } from '../generated/prisma/internal/prismaNamespace.js';
import { relationship } from '../generated/prisma/enums.js';
import { DatabaseException } from '../core/exceptions/app-exceptions.js';
import { request } from 'express';
export interface OneToOneRelationship {
  user_1: string
  user_2: string
  status: relationship
  last_update?: Date
}

export interface OneToManyRelationship {
  user_1: string
  user_2: string
  user_1_status: relationship
  user_2_status: relationship
  last_update?: Date
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
  async addOrUpdateRelationship(relationship:OneToOneRelationship) {
    try {
      const request = await this.prisma.friendships.upsert ({
        where: {
          id1_id2: {
            id1: relationship.user_1,
            id2: relationship.user_2
          }
        },
        create: {
          id1: relationship.user_1,
          id2: relationship.user_2,
          status: relationship.status
        },
        update: {
          status: relationship.status,
          last_update: relationship.last_update
        }
      })
      return request
    }
    catch (err) {
      if (err instanceof (PrismaClientKnownRequestError)) {
        throw new DatabaseException('Relationship',`Failed to add or update relationship: ${err}`,'Failed add or update',500)
      }
      throw err
    }
  }
  async deleteRelationship(relationship: OneToOneRelationship) {
    try {
      const request = await this.prisma.friendships.delete({
        where: {
          id1_id2: {
            id1: relationship.user_1,
            id2:relationship.user_2
          }
        }
      })
      return request
    }
    catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new BadRequestException("Relationship not exists")
        }
        throw new DatabaseException("Relationship", `Failed to delete user relationship: ${err}`, 'Failed to delete user relationship', 500)
      }
      throw err
    }
  }
}
