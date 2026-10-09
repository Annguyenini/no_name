import { SupabaseClient } from "@supabase/supabase-js";
import { SignUpDTO } from "./dto/signup.dto.js";
import { ResposeDTO } from "./dto/respone.dto.js";
import { UserRepositoryService } from "../users/users.repository.service.js";
import { BadRequestException, InternalServerErrorException, UnauthorizedException,Injectable } from "@nestjs/common";
import { CompleteSignUpDTO } from "./dto/complete-signup.dto.js";
import { UserDTO } from "../users/dto/user.dto.js";
import { SignInDTO } from "./dto/signin.dto.js";

// all request made to this point have to be verify their identities
@Injectable()
export class AuthRepositoryService{
  constructor(private readonly supabase: SupabaseClient,
    private readonly user_repository :UserRepositoryService ) { }

  async signUp(credential: SignUpDTO) {
    // email verification is turning on
    try {
      const user = await this.supabase.auth.signUp({
        email: credential.email,
        password: credential.password,
      })
      if (user.error || !user.data.user) {
        throw new BadRequestException("Email already associate with an account")
      }
      return user
      }

  catch(err) {
    throw err
    }
  }
  async emailVerification(email: string, token: string) {
    try {
      const verify = await this.supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })
      if (verify.error || !verify.data) {
        throw new Error(`Failed to verify token`)
      }
      return verify
    }
    catch (err) {
      throw new InternalServerErrorException(`Failed to verify email: ${err}`)
    }
  }
  async completeSignUp(user:UserDTO) {

    try {
      // check if username exists

      if (await this.user_repository.getUserByUsername(user.username)) {
        throw new BadRequestException("Username already exists")
      }

      const insert = await this.user_repository.insertNewUser(user)
      if (!insert) {
        throw new Error("Unexpected error occur when try to insert new user")
      }
      return insert
    }
    catch (err) {
      throw new InternalServerErrorException(`Failed to completeSignUp: ${err}`)
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
      if (signin.error || !signin.data) {
        throw new UnauthorizedException(`Invalid credential`)
      }
      return signin
    }
    catch (err) {
      throw new InternalServerErrorException (`Failed to sign in with supabase: ${err}`)
    }
  }
}
