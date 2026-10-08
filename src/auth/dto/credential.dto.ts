import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class CredentialDTO{
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string
}
