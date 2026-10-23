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
  constructor(user_id: string) {
    if(!user_id ) throw new BadRequestException("user_id require")
    this.bucket = `avatar`
    this.key = `avatar/${user_id}.jpg`
    this.content_type = "image/jpg"
  }
  getUploadObject(): S3Object {
    const object: S3Object = {
      bucket:this.bucket,
      key:this.key,
      content_type:this.content_type,
      };
  return object
  }
}
