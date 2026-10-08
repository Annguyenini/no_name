import { PrismaClient } from "@prisma/client/extension";
import { SupabaseClient } from "@supabase/supabase-js";
import { SignUpDTO } from "./dto/signup.dto.js";
import { ResposeDTO } from "./dto/respone.dto.js";
import { UserRepositoryService } from "../users/users.repository.service.js";
import { BadRequestException } from "@nestjs/common";
import { CompleteSignUpDTO } from "./dto/complete-signup.dto.js";
import { UserDTO } from "../users/dto/user.dto.js";
import { SignInDTO } from "./dto/signin.dto.js";
// all request made to this point have to be verify their identities

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

  async completeSignUp(user:UserDTO):Promise<UserDTO| null> {

    try {
      // check if username exists

      if (await this.user_repository.getUserByUsername(user.username)) {
        throw new BadRequestException("Username already exists")
      }

      const insert = this.user_repository.insertNewUser(user)
      if (!insert) {
        throw new Error("Unexpected error occur when try to insert new user")
      }
      return insert
    }
    catch (err) {
      throw new Error(`Failed to completeSignUp: ${err}`)
    }
  }
  async signIn(user: SignInDTO) {
    try {
      const signin = await this.supabase.auth.signInWithPassword(
        {
          email: user.indentifier,
          password:user.password
        }
      )
      return signin
    }
    catch (err) {
      throw new Error (`Failed to sign in with supabase: ${err}`)
    }
  }

}
