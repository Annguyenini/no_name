import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { S3Service } from '../aws/s3/s3.service.js';
import { ContentObject } from '../aws/s3/s3.object.js';
import { UploadRequests } from './contents-requests.service.js';

@Injectable()
export class ContentsRepositoryService {
  constructor(private readonly s3_service : S3Service,private readonly upload_requests_list : UploadRequests ){}

  // -MIMO: Generate and track a time-limited upload request for reusable content workflows.
  async requestUploadUrl(user_id: string, object: ContentObject) {
    const object_data = object.getUploadObject();
    const active_request = this.upload_requests_list.getObjectFromMap(object_data.key);
    if (active_request?.expire_at && Date.now() < active_request.expire_at) {
      throw new BadGatewayException('Request already in the queue');
    }

    const url = await this.s3_service.generateUploadUrl(object)
    this.upload_requests_list.addObjectIntoMap(object_data.key, {
      user_id,
      key: object_data.key,
      content_type: object_data.content_type,
      expire_at: Date.now() + 5 * 60 * 1000,
    });
    return url
  }

  // -MIMO: Verify an owned, unexpired upload against S3 metadata and consume its pending request.
  async verifyUploadRequest(user_id: string, object: ContentObject) {
    const object_data = object.getUploadObject();
    const pending_request = this.upload_requests_list.getObjectFromMap(object_data.key);
    if (!pending_request || pending_request.user_id !== user_id || pending_request.expire_at < Date.now()) {
      throw new BadRequestException('Upload request missing, expired, or not owned by this user');
    }

    const uploaded_object = await this.s3_service.getObjectData(object);
    if (!uploaded_object) throw new BadRequestException('Upload not found');

    if (
      !uploaded_object.ContentLength ||
      uploaded_object.ContentLength > object_data.max_content_size ||
      uploaded_object.ContentType !== object_data.content_type ||
      pending_request.content_type !== object_data.content_type
    ) {
      throw new BadRequestException('Uploaded object does not match the upload requirements');
    }

    this.upload_requests_list.deleteObjectFromMap(object_data.key);
    return uploaded_object;
  }

  async getContentAccessUrl(object: ContentObject, expire_in: number) {
    // cache later
    return this.s3_service.generateAccessUrl(object, expire_in)
  }
}
