import { IsJSON, IsNumber, IsObject, IsString } from "class-validator";

export class ResposeDTO{
  @IsObject()
  data?: Object

  error?:Object
}
