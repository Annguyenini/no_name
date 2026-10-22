import { IsString } from "class-validator"

export class BaseContentDTO{
  @IsString()
  content_id: string
  @IsString()
  content_type: string
}
