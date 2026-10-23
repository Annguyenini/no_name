import { Injectable } from '@nestjs/common';
import { S3Service } from '../aws/s3/s3.service.js';
import { AvatarUploadObject, UploadObject } from '../aws/s3/s3.object.js';
@Injectable()
export class ContentsRepositoryService {
  constructor(private readonly s3_service : S3Service ){}
  async requestUploadUrls(object: UploadObject) {
    const url = await this.s3_service.generateUploadUrl(object)
    return url
  }
  // we could implement a hash table to check if the key is pendsing before call cloud

  async objectExists(object: UploadObject) {
    const exist = await this.s3_service.objectExists(object)
    return exist
  }
}
