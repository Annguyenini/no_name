import { Injectable } from '@nestjs/common';
import { S3Service } from '../aws/s3/s3.service.js';
@Injectable()
export class ContentsRepositoryService {
  constructor(private readonly s3_service : S3Service ){}
  async requestUploadUrls(key:string,bucket:string,content_type:string) {
    const url = await this.s3_service.generateUploadUrl(bucket, key, content_type)
    return url
  }


}
