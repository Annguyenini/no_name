import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '../../config/config.service.js';

@Injectable()
export class S3InstanceService {
  private s3_instance: AWS.S3
  constructor(private readonly config:ConfigService){}
  getClient() {
    if (!this.s3_instance) {
      this.s3_instance = new AWS.S3({
        accessKeyId: this.config.getAwsConfig().AWS_ACCESS_KEY,
        secretAccessKey:this.config.getAwsConfig().AWS_SECRET_ACCESS_KEY
      })
    }
    return this.s3_instance
  }
}
