import { BadGatewayException, BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserDTO } from "./dto/user.dto.js";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace.js";
import { ContentsRepositoryService } from "../contents/contents.repository.service.js";
import { AvatarUploadObject } from "../aws/s3/s3.object.js";
import { UploadRequests } from "../contents/contents-requests.service.js";
import { AppException } from "../core/exceptions/app-exceptions.js";
@Injectable()



export class UserRepositoryService{
  constructor(private readonly prisma: PrismaService,
    private readonly contents_repository_service: ContentsRepositoryService,
    private readonly upload_requests_list : UploadRequests) { }

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
    // check if the request for this key exists in the list
    const object_pre = object.getUploadObject()
    const exists = this.upload_requests_list.getObjectFromMap(object_pre.key)
    // if exists and not expire, throw error
    if (exists) {
      if (exists.expire_at && Date.now() < exists.expire_at) throw new BadGatewayException("Request already in the queue")
    }

    const request = await this.contents_repository_service.requestUploadUrls(object)
    // if successfully request the url, add into upload set
    if (!this.upload_requests_list.addObjectIntoMap(object_pre.key, {
      user_id: user_id,
      key: object_pre.key,
      content_type: "image/jpeg",
      // expire within 5 mins
      expire_at: Date.now()+5*60*1000
    })) throw new AppException("request upload url","Failed to add upload request into queue","Failed to generate upload url",500)
    return request
  }
  async checkAvatarUploadURL(user_id: string) {
    const object = new AvatarUploadObject(user_id)
    // check if the request in the list first
    const object_req = object.getUploadObject()
    const request_exists = this.upload_requests_list.getObjectFromMap(object_req.key)

    if (!request_exists || request_exists.expire_at < Date.now()) throw new BadRequestException("Request not in the list or have expire")

    const exists = await this.contents_repository_service.getContentData(object)
    if(!exists) throw new BadRequestException("Upload not found")

    // if avatar found, check if the size make sense and the type is correct
    if(!exists.ContentLength || exists.ContentLength > object_req.max_content_size || exists.ContentType !==object_req.content_type)throw new BadRequestException("Object not match")
    // if verify complete, delete from the upload list
    if (exists) this.upload_requests_list.deleteObjectFromMap(object_req.key)
    return exists
  }
}
