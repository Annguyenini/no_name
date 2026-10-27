import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserDTO } from "./dto/user.dto.js";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace.js";
import { ContentsRepositoryService } from "../contents/contents.repository.service.js";
import { AvatarUploadObject } from "../aws/s3/s3.object.js";
@Injectable()



export class UserRepositoryService{
  constructor(private readonly prisma: PrismaService,
    private readonly contents_repository_service: ContentsRepositoryService) { }

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

  async getUserAvatarAccessUrl(id: string) {
    const avatar_model = new AvatarUploadObject(id)
    const access_url = await this.contents_repository_service.getContentAccessUrl(avatar_model, 300)
    return access_url
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
  async updateUserAvatarProperties(id: string, avatar_properties: any) {
    try {
      const response = await this.prisma.users.update({
        where: { id },
        data:{avatar_properties}
      })
      return response
    }
    catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === "P2025") {
        return null
      }
      throw err
    }
  }
  async insertNewUser(user: UserDTO): Promise<UserDTO> {
    try{
    const success = await this.prisma.users.create({
      data: {
        id: user.id,
        username:user.username,
        display_name: user.display_name,
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
  // -MIMO: Delegate avatar upload URL creation and pending-request tracking to the reusable contents repository.
  async requestAvatarUploadURL(user_id: string) {
    const object = new AvatarUploadObject(user_id)
    return this.contents_repository_service.requestUploadUrl(user_id, object)
  }
  // -MIMO: Delegate S3 metadata verification and pending-request consumption to the reusable contents repository.
  async checkAvatarUploadURL(user_id: string) {
    const object = new AvatarUploadObject(user_id)
    return this.contents_repository_service.verifyUploadRequest(user_id, object)
  }
}
