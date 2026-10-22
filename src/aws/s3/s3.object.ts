import { BadRequestException, Injectable } from "@nestjs/common"
import { UploadObjectDTO } from "./dto/upload-object.dto.js"


export abstract class UploadObject{
  abstract getUploadObject(): UploadObjectDTO;
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
  getUploadObject(): UploadObjectDTO {
    return new UploadObjectDTO(
      this.bucket,
      this.key,
      this.content_type,
    );
  }
}
