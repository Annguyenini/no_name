import { Injectable } from "@nestjs/common";
import * as AWS from "aws-sdk"
import { S3InstanceService } from "./s3.instance.service.js";
@Injectable()
export class S3Service {
  private s3_instance
  constructor(private readonly s3_instance_service:S3InstanceService) {
    this.s3_instance = s3_instance_service.getClient()
  }
  async s3_upload(file: string, bucket: string, name: string, mimetype: string) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1',
      },
    };
    try {
      let s3Response = await this.s3_instance.upload(params).promise();
      return s3Response;
    } catch (err) {
      console.log(err);
    }
  }
}
