import { Injectable, NotFoundException } from '@nestjs/common';
import { TripDTO } from '../dto/trip.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PrismaClientKnownRequestError } from '../../generated/prisma/internal/prismaNamespace.js';
import { prismaHandler } from '../../core/handlers/prisma-handler.js';

@Injectable()
export class TripRepositoryService {
  constructor(private readonly prisma:PrismaService){}
  async createTrip(trip: TripDTO) {
    return prismaHandler(this.prisma.trip.create({
      data: {
        id: trip.trip_id,
        trip_name: trip.trip_name,
        created_time: trip.created_time,
        image_cover_key: trip.image_cover_key,
      }
    }))
  }
  async endTrip(trip_id:string,ended_time:Date) {
    return prismaHandler(this.prisma.trip.update({
      where: {
        id:trip_id
      },
      data: {
        ended_time
      }
      }))
  }
  async updateTripName(trip_id:string,trip_name: string,user_id:string) {
    // only allow owner or admin modify
    return prismaHandler(
    this.prisma.trip.update({
        where: {
        id: trip_id,
        permission: {
          some: {
            user_id,
            role: {
              in:['admin','owner']
            }
            }
          }
        },
        data: {
          trip_name:trip_name
        }
        }))
  }
  async updateTripCoverImageKey(trip_id: string, image_key: string, user_id: string) {
    // only allow owner or admin modify

    return prismaHandler(this.prisma.trip.update({
    where: {
      id: trip_id,
      permission: {
        some: {
          user_id,
          role: {
            in:['admin','owner']
          }
          }
        }
    },
    data: {
      image_cover_key:image_key
    }
    }))

  }
  async deleteTrip(trip_id: string, user_id: string) {
    // only allow owner or admin delete

    return prismaHandler(this.prisma.trip.delete({
      where: {
        id: trip_id,
        permission: {
          some: {
            user_id,
            role: {
              in:['admin','owner']
            }
            }
          }
      }
    }))
  }
  // async archiveTrip(){}
  async getTripData(trip_id: string, user_id: string) {
    // only allow user who a member to get the data

    return prismaHandler(this.prisma.trip.findUniqueOrThrow({
      where: {
        id: trip_id,
        permission: {
          some: {
            user_id
            }
          }
      }
    }))
  }
}
