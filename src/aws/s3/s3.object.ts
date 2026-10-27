import { BadRequestException, Injectable } from "@nestjs/common"
import type { S3Object } from "./dto/object.js"



export abstract class ContentObject{
  abstract getUploadObject(): S3Object;
}
@Injectable()
export class AvatarUploadObject implements ContentObject {
  private bucket: string
  private key: string
  private content_type:string
  private max_object_size: number
  private expires_in:number
  constructor(user_id: string) {
    if(!user_id ) throw new BadRequestException("user_id require")
    this.bucket = `no-name-v1`
    this.key = `avatar/${user_id}.jpg`
    this.content_type = "image/jpeg"
    this.max_object_size = 5 * 1024 * 1024
  }
  // -MIMO: Expose the avatar's S3 key, MIME type, and size limit as a typed upload specification.
  getUploadObject(): S3Object {
    const object: S3Object = {
      bucket:this.bucket,
      key:this.key,
      content_type: this.content_type,
      max_content_size: this.max_object_size,
      };
  return object
  }
}
