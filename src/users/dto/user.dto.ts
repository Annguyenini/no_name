import { UuidFactory } from "@nestjs/core/internal";
import { IsString } from "class-validator";
import { UUID } from "crypto";
import { users } from "../../generated/prisma/client.js";

export class UserDTO {
  @IsString()
  id:string
  username: string
  display_name:string
  status: string | null
  avatar_properties: any | null
  // construct from prisma
  prismaBuild(user: users) {
    this.id = user.id
    this.username = user.username
    this.display_name = user.display_name
    this.status = user.status

    this.avatar_properties = user.avatar_properties ?? null

    return this
  }
}
