import { prismaHandler } from "../../core/handlers/prisma-handler.js";
import { PrismaService } from "../../prisma/prisma.service.js";
export class TripPermissionRepository {

  constructor(private readonly prisma: PrismaService) { }
  async getMemberFromTrip(trip_id: string, user_id: string) {
    return prismaHandler( this.prisma.trip_members.findUniqueOrThrow({
      where: {
        user_id_trip_id: {
        user_id,trip_id
      }
      }
    }))
  }
}
