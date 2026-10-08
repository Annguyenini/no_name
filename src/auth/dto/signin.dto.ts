import { IsString } from "class-validator";
import { CredentialDTO } from "./credential.dto.js";

export class SignInDTO extends CredentialDTO{
  @IsString()
  indentifier: string
}
