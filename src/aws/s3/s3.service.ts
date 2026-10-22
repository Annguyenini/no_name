import { Injectable } from "@nestjs/common";
import { S3InstanceService } from "./s3.instance.service.js";
import * as AWS from 'aws-sdk';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service {
  private s3_instance
  constructor(private readonly s3_instance_service:S3InstanceService) {
    this.s3_instance = s3_instance_service.getClient()
  }
  async s3_upload(file: string, bucket: string, name: string, mimetype: string) {
    const params = new PutObjectCommand({
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
    });
      let s3Response = await this.s3_instance.send(params)
      return s3Response;
  }

  async generateUploadUrl(bucket: string, key: string, content_type: string) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType:content_type
    })

    const request = await getSignedUrl(this.s3_instance, command, { expiresIn: 300 })
    return request
  }
}
