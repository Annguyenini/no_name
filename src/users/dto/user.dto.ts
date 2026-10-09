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
  avatar_url: string | null
  // construct from prisma
  prismaBuild(user: users) {
    this.id = user.id
    this.username = user.username
    this.display_name = user.display_name
    this.status = user.status
    this.avatar_url = user.avatar_url ?? null
    return this
  }
}
