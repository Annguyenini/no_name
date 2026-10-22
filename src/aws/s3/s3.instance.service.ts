import { Injectable } from '@nestjs/common';
import { S3Client, ListBucketsCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { ConfigService } from '../../config/config.service.js';

@Injectable()
export class S3InstanceService {
  private s3_instance: S3Client
  constructor(private readonly config:ConfigService){}
  getClient() {
    if (!this.s3_instance) {
      this.s3_instance = new S3Client({
        region:this.config.getAwsConfig().AWS_REGION,
        credentials: {
          accessKeyId: this.config.getAwsConfig().AWS_ACCESS_KEY,
          secretAccessKey:this.config.getAwsConfig().AWS_SECRET_ACCESS_KEY
        }
      })
    }
    return this.s3_instance
  }
}
