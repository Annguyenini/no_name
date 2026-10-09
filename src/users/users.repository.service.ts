import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserDTO } from "./dto/user.dto.js";
@Injectable()
export class UserRepositoryService{
  constructor(private readonly prisma: PrismaService) { }

  async getUserByUsername(username: string): Promise<UserDTO | null> {
    try{
    const response = await this.prisma.users.findUnique({
      where: {
        username,
        },
    },
    )
    if (!response) return null
    const user = new UserDTO().prismaBuild(response)
      return user
    }
    catch (err) {
      throw new Error(`Failed to get user by username at user repository: ${err}`)
    }
  }
  async insertNewUser(user: UserDTO): Promise<UserDTO | null> {
    try {
      const success = await this.prisma.users.upsert({
        where: {
          id: user.id
        },
        create: {
          id: user.id,
          username:user.username,
          display_name: user.username,
          avatar_url :user.avatar_url,
          status:"active"
        },
        update: {
          username: user.username,
          display_name:user.display_name,
            avatar_url :user.avatar_url
        }
      })
      if (!success) return null
      const User = new UserDTO().prismaBuild(success)
      return User
    }
    catch (err) {
      throw err
    }
  }
}
