import { IsNotEmpty, IsString } from "class-validator";

export class UploadObjectDTO {
  constructor(bucket: string, key: string, content_type: string) {
    this.bucket = bucket;
    this.key = key;
    this.content_type = content_type;
  }

  @IsString()
  bucket: string;

  @IsString()
  key: string;

  @IsString()
  content_type: string;
}
