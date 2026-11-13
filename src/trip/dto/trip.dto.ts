import { trip_privacy } from '../../generated/prisma/enums.js';

export class TripDTO{
  trip_id: string
  trip_name: string
  image_cover_key?: string
  created_time: Date
  ended_time?: Date
  privacy: trip_privacy
}
