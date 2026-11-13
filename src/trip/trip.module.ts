import { Module } from '@nestjs/common';
import { TripController } from './controller/trip.controller.js';
import { TripService } from './services/trip.service.js';

@Module({
  controllers: [TripController],
  providers: [TripService]
})
export class TripModule {}
