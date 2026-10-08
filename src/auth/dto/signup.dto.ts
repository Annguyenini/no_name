import { IsEmail, IsString } from "class-validator";
import { CredentialDTO } from "./credential.dto.js";

export class SignUpDTO extends CredentialDTO {
  @IsEmail()
  email: string


}
