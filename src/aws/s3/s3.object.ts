import { BadRequestException, Injectable } from "@nestjs/common"
import { S3Object } from "./dto/object.js"



export abstract class UploadObject{
  abstract getUploadObject(): any;
}
@Injectable()
export class AvatarUploadObject implements UploadObject {
  private bucket: string
  private key: string
  private content_type:string
  private max_object_size:number
  constructor(user_id: string) {
    if(!user_id ) throw new BadRequestException("user_id require")
    this.bucket = `no-name-v1`
    this.key = `avatar/${user_id}.jpg`
    this.content_type = "image/jpg"
    this.max_object_size = 5 * 1024 * 1024
  }
  getUploadObject(): S3Object {
    const object: S3Object = {
      bucket:this.bucket,
      key:this.key,
      content_type: this.content_type,
      max_content_size: this.max_object_size
      };
  return object
  }
}
