import { IsString } from 'class-validator';

export class UpdateDisplayNameDTO {
  @IsString()
  display_name: string;
}
