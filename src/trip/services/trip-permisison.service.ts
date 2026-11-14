import { Injectable, NotFoundException } from "@nestjs/common";
import { TripPermissionRepository } from "../repositories/trip-permission.repository.js";
import { trip_role } from "../../generated/prisma/enums.js";
import { DatabaseException } from "../../core/exceptions/app-exceptions.js";
export type roles = trip_role

@Injectable()
export class TripPermissionService {
  constructor(private readonly trip_permission_repository: TripPermissionRepository) { }
  async getUserRole(user_id: string, trip_id: string):Promise<roles|null> {
    const membership = await this.trip_permission_repository.getMemberFromTrip(trip_id, user_id)
    if (!membership) throw new NotFoundException("User not a member in trip")
    return membership.role
  }

}
