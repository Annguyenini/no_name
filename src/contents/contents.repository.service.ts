import { Injectable } from '@nestjs/common';
import { S3Service } from '../aws/s3/s3.service.js';
import { UploadObjectDTO } from '../aws/s3/dto/upload-object.dto.js';
import { AvatarUploadObject } from '../aws/s3/s3.object.js';
@Injectable()
export class ContentsRepositoryService {
  constructor(private readonly s3_service : S3Service ){}
  async requestUploadUrls(object: AvatarUploadObject) {
    const url = await this.s3_service.generateUploadUrl(object)
    return url
  }


}
