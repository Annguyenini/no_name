
import { BadRequestException, Injectable } from '@nestjs/common';
import { TripDTO } from '../dto/trip.dto.js';
import { TripRepositoryService } from '../repositories/trip.repository.service.js';
import { S3Service } from '../../aws/s3/s3.service.js';
import { TripCoverUploadObject } from '../../aws/s3/s3.object.js';
import { randomUUID } from 'node:crypto';
import { AWSExceptions } from '../../core/exceptions/app-exceptions.js';
import { ContentsRepositoryService } from '../../contents/contents.repository.service.js';
import { TripMembersRepository } from '../repositories/trip-members.repository.service.js';
import { TripPermissionPolicies } from '../validations/trip-permission-validation.js';

@Injectable()
export class TripService {
  constructor(private readonly trip_repository: TripRepositoryService,
    private readonly s3_service: S3Service,
    private readonly contents_service: ContentsRepositoryService,
    private readonly trip_members: TripMembersRepository,
    private readonly trip_permission_policies: TripPermissionPolicies) { }

  async createTrip(trip: TripDTO) {
    // allow user to create more than 1 trip at the same time
    //  trip_name can be duplicate

    return this.trip_repository.createTrip(trip)
  }

  async endTrip(trip_id: string, ended_time: Date,user_id:string ) {
    this.trip_permission_policies.owner(trip_id, user_id)
    return this.trip_repository.endTrip(trip_id, ended_time, user_id)
  }

  async updateTripName(trip_id:string,trip_name: string,user_id:string) {
    this.trip_permission_policies.allowToModify(trip_id, user_id)
    return this.trip_repository.updateTripName(trip_id, trip_name,user_id)
  }

  async requestTripCoverImageUpdateURL(trip_id: string,user_id:string) {
    this.trip_permission_policies.allowToModify(trip_id, user_id)
    const tag = Date.toString()
    const trip_cover_image_object = new TripCoverUploadObject(trip_id,tag)
    try {
      const url = await this.contents_service.requestUploadUrl(user_id,trip_cover_image_object)
      return { url,tag }
    }
    catch (err) {
      throw new AWSExceptions(`Failed to generate trip cover image upload key: ${err}`, `Failed to generate trip cover image upload key`)
    }
  }

  async validateTripCoverImageUpdate(trip_id: string,tag:string,user_id:string ) {
    this.trip_permission_policies.allowToModify(trip_id, user_id)
    // regenerate uplaod object
    const trip_cover_image_object = new TripCoverUploadObject(trip_id, tag)
    // check if upload object in the s3
    const upload_object = await this.contents_service.verifyUploadRequest(user_id, trip_cover_image_object)
    // throw if uplaod object not exists
    if (!upload_object) throw new BadRequestException("The image not exists")
    const new_image_key = trip_cover_image_object.getUploadObject().key
    // return promise to update the key
    return this.trip_repository.updateTripCoverImageKey(trip_id, new_image_key, user_id)
  }

  async deleteTrip(trip_id: string, user_id: string) {
    this.trip_permission_policies.owner(trip_id, user_id)
    return this.trip_repository.deleteTrip(trip_id, user_id)
  }

  async getTripData(trip_id: string, user_id: string) {
    //allow everyone to get trip data
    return this.trip_repository.getTripData(trip_id, user_id)
  }

  async getTripMembers(trip_id: string, user_id: string) {
    //allow everyone to get trip members
    return this.trip_members.getTripMembers(trip_id)
  }

  async getMyTrips(user_id: string) {

    return this.trip_members.getUserTrips(user_id)
  }
}
