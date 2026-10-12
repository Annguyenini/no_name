import { IsEmail, IsString } from "class-validator";

export class Email {
  @IsEmail()
  email: string;
}
