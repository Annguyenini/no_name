import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserDTO } from "./dto/user.dto.js";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace.js";
import { ContentsRepositoryService } from "../contents/contents.repository.service.js";
import { AvatarUploadObject } from "../aws/s3/s3.object.js";
@Injectable()



export class UserRepositoryService{
  constructor(private readonly prisma: PrismaService,
   private readonly contents_repository_service :ContentsRepositoryService) { }

  async getUserByUsername(username: string): Promise<UserDTO | null> {
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
  async getUserById(id:string) {
    const response = await this.prisma.users.findUnique({
      where: {
        id,
      },
    },)
    if (!response) return null
    const user = new UserDTO().prismaBuild(response)
    return user

  }

  async updateDisplayName(id: string, displayName: string): Promise<UserDTO | null> {
    try {
      const response = await this.prisma.users.update({
        where: { id },
        data: { display_name: displayName },
      });
      return new UserDTO().prismaBuild(response);
    } catch (err) {
      // pass if not found
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
        return null;
      }
      throw err;
    }
  }

  async insertNewUser(user: UserDTO): Promise<UserDTO> {
    try{
    const success = await this.prisma.users.create({
      data: {
        id: user.id,
        username:user.username,
        display_name: user.display_name,
        avatar_url :user.avatar_url,
        status:"active"
      }
    })
    if (!success) throw new Error("Failed to insert user to database")
    const User = new UserDTO().prismaBuild(success)
      return User
    }
    catch (err) {
      if (err instanceof (PrismaClientKnownRequestError) && err.code === "P2002") {
        throw new ConflictException(`Username already exists`)
      }
      throw err
    }
  }
  async requestAvatarUploadURL(user_id: string) {

    const object = new AvatarUploadObject(user_id)
    const request = await this.contents_repository_service.requestUploadUrls(object)
    return request
  }
  async checkAvatarUploadURL(user_id: string) {
    const object = new AvatarUploadObject(user_id)
    const exists = await this.contents_repository_service.objectExists(object)
    return exists
  }
}
