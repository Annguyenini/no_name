import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { trip_role } from "../../generated/prisma/enums.js";
import { prismaHandler } from "../../core/handlers/prisma-handler.js";
@Injectable()
export class TripMembersRepository{
  constructor(private readonly prisma: PrismaService) { }

  getUserTrips(user_id: string, role?: trip_role) {
    // get user trips base on their role or the whole trip
    let query
    if (role) {
      query = this.prisma.trip_members.findMany({
        where: {
          AND: [
            { user_id },
            { role }
          ]
        }
      })
    }
    else {
      query =this.prisma.trip_members.findMany({
        where: {
          user_id
        }
      })
    }
    return prismaHandler(query)
  }
  getUserTripPermission(user_id: string, trip_id: string) {
    return prismaHandler(this.prisma.trip_members.findFirstOrThrow({
      where: {
        AND: [
          { trip_id},
          {user_id}
        ]
      }
    }))
  }
  getTripMembers(trip_id: string) {
    return prismaHandler(this.prisma.trip_members.findMany({
      where: {
        trip_id
      }
    }))
  }
}
