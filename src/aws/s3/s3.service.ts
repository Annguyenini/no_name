import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { S3InstanceService } from "./s3.instance.service.js";
import * as AWS from 'aws-sdk';
import { S3Client, PutObjectCommand, HeadObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploadObject } from "./s3.object.js";



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

  async generateUploadUrl(object: UploadObject) {
    const object_pro = object.getUploadObject()
    const command = new PutObjectCommand({
      Bucket: object_pro.bucket,
      Key: object_pro.key,
      ContentType: object_pro.content_type
    })

    const request = await getSignedUrl(this.s3_instance, command, { expiresIn: 300 })
    return request
  }

  async getObjectData(object: UploadObject) {
    const object_pro = object.getUploadObject()

    try {
      return await this.s3_instance.send(
        new HeadObjectCommand({Bucket:object_pro.bucket,Key:object_pro.key})
      )
    }
    catch (err) {
      const status_code = (err as {$metadata? : {httpStatusCode?: number}}).$metadata?.httpStatusCode ?? 500
      if (status_code === 404) {
        // not found
        return null
      }
      throw err
    }
  }
}
