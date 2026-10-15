import { IsString, Matches } from "class-validator";

export class CreateProfileDTO {
  @IsString()
  @Matches(/^[A-Za-z0-9]{6,10}$/, {
    message: 'username must be 6 to 10 characters and contain only ASCII letters or numbers',
  })
  username: string

  @IsString()
  display_name: string
}
