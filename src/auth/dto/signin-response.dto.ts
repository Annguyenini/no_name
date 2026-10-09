import { IsString } from "class-validator"

export class SignInResponseDTO{
  @IsString()
  id: string
  access_token: string
  refresh_token:string
}
