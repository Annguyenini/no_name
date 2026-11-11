import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { S3InstanceService } from "./s3.instance.service.js";
import * as AWS from 'aws-sdk';
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ContentObject } from "./s3.object.js";
import { ConfigService } from "../../config/config.service.js";



@Injectable()
export class S3Service {
  private s3_instance
  private s3_instance_service
  constructor( readonly config:ConfigService) {
    this.s3_instance_service = new S3InstanceService(config)

    this.s3_instance = this.s3_instance_service.getClient()
  }
  async generateUploadUrl(object: ContentObject) {
    const object_pro = object.getUploadObject()
    const command = new PutObjectCommand({
      Bucket: object_pro.bucket,
      Key: object_pro.key,
      ContentType: object_pro.content_type
    })

    const request = await getSignedUrl(this.s3_instance, command, { expiresIn: 300 })
    return request
  }

  async generateAccessUrl(object: ContentObject,expire_in:number) {
    const object_pro = object.getUploadObject()
    const command = new GetObjectCommand({
      Bucket: object_pro.bucket,
      Key:object_pro.key
    })
    return getSignedUrl(this.s3_instance, command, { expiresIn: expire_in });
  }

  async getObjectData(object: ContentObject) {
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
