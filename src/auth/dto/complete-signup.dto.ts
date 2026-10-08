import { IsString } from "class-validator"
import { CredentialDTO } from "./credential.dto.js"

export class CompleteSignUpDTO extends CredentialDTO{
  @IsString()
  id: string

  @IsString()
  username: string

  @IsString()
  display_name:string
}
