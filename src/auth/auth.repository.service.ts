import { PrismaClient } from "@prisma/client/extension";
import { SupabaseClient } from "@supabase/supabase-js";
import { SignUpDTO } from "./dto/signup.dto.js";
import { ResposeDTO } from "./dto/respone.dto.js";
import { UserRepositoryService } from "../users/users.repository.service.js";
import { BadRequestException } from "@nestjs/common";
import { CompleteSignUpDTO } from "./dto/complete-signup.dto.js";
import { UserDTO } from "../users/dto/user.dto.js";


export class AuthRepositoryService{
  constructor(private readonly supabase: SupabaseClient,
    private readonly user_repository :UserRepositoryService ) { }

  async signUp(credential: SignUpDTO) {
    // email verification is turning on
    const user = await this.supabase.auth.signUp({
      email: credential.email,
      password: credential.password,
    })

    return user
    }

  async completeSignUp(credential:CompleteSignUpDTO) {
    // check if username exists
    if (await this.user_repository.getUserByUsername(credential.username)) {
      throw new BadRequestException("Username already exists")
    }
    const user = new UserDTO
    const insert = this.user_repository.insertNewUser(user)
  }
}
