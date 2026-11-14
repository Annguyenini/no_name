import { PermissionException, TripPermissionException } from "../../core/exceptions/app-exceptions.js";
import { TripPermissionService } from "../services/trip-permisison.service.js";

export class TripPermissionPolicies {
  constructor(private readonly trip_permission: TripPermissionService) { }
  async allowToModify(trip_id: string, user_id: string) {
    // raise Permission error if user doesn't have a right role
    const role = await this.trip_permission.getUserRole(user_id, trip_id)
    if (!role || !(role==="admin" ||role==="owner")) throw new TripPermissionException(`Permission error. Actor trying to modify tyrip without permission`,'Permission Error',user_id)
  }
  async owner(trip_id: string, user_id: string) {
    const role = await this.trip_permission.getUserRole(user_id, trip_id)
    if (!role || role!=="owner") throw new TripPermissionException(`Permission error. Actor trying to peform action require owner permission.`,'Permission Error',user_id)
  }
}
