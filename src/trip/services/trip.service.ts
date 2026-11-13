import { Injectable } from '@nestjs/common';
import { TripDTO } from '../dto/trip.dto.js';
import { TripRepositoryService } from '../repositories/trip.repository.service.js';

@Injectable()
export class TripService {
  constructor(private readonly trip_repository:TripRepositoryService){}
  async createTrip(trip: TripDTO) {
    return this.trip_repository.createTrip(trip)
  }
  async endTrip(trip_id: string, ended_time: Date) {
    return this.trip_repository.endTrip(trip_id,ended_time)
  }
  async updateTripName(trip_id:string,trip_name: string) {
    return this.trip_repository.updateTripName(trip_id, trip_name)
  }
  async updateTripAvatar(trip_id: string, trip_name: string) {

  }
}
