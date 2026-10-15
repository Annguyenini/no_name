import { SupabaseClient } from "@supabase/supabase-js";
import { SignUpDTO } from "./dto/signup.dto.js";
import { ResposeDTO } from "./dto/respone.dto.js";
import { UserRepositoryService } from "../users/users.repository.service.js";
import { BadRequestException, InternalServerErrorException, UnauthorizedException,Injectable, Inject } from "@nestjs/common";
import { CompleteSignUpDTO } from "./dto/complete-signup.dto.js";
import { UserDTO } from "../users/dto/user.dto.js";
import { SignInDTO } from "./dto/signin.dto.js";
import { SupabaseService } from "../supabase/supabase.service.js";
import { response } from "express";
import { AppException, RepositoryExceptions, SupabaseException, SystemException } from "../core/exceptions/app-exceptions.js";
import { Email } from "./dto/verify-email.sto.js";

// all request made to this point have to be verify their identities
@Injectable()
export class AuthRepositoryService{
  private supabase: SupabaseClient
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly user_repository: UserRepositoryService) {
    this.supabase = this.supabaseService.getClient()
    }

  async signUp(credential: SignUpDTO) {
    // email verification is turning on
    try {
      const user = await this.supabase.auth.signUp({
        email: credential.email,
        password: credential.password,
      })

      if (user.error || !user.data.user) {
        console.error(user.error)
        throw new BadRequestException("Email already associate with an account")
      }
      return user
      }

  catch(err) {
    throw err
    }
  }
  // async emailVerification(email: string, token: string) {
  //   try {
  //     const verify = await this.supabase.auth.verifyOtp({
  //       email,
  //       token,
  //       type: 'email'
  //     })
  //     if (verify.error || !verify.data) {
  //       throw new Error(`Failed to verify token`)
  //     }
  //     return verify
  //   }
  //   catch (err) {
  //     throw new InternalServerErrorException(`Failed to verify email: ${err}`)
  //   }
  // }
  // async completeSignUp(user:UserDTO) {

  //   try {
  //     // check if username exists

  //     if (await this.user_repository.getUserByUsername(user.username)) {
  //       throw new BadRequestException("Username already exists")
  //     }

  //     const insert = await this.user_repository.insertNewUser(user)
  //     if (!insert) {
  //       throw new Error("Unexpected error occur when try to insert new user")
  //     }
  //     return insert
  //   }
  //   catch (err) {
  //     throw new InternalServerErrorException(`Failed to completeSignUp: ${err}`)
  //   }
  // }
  async signIn(user: SignInDTO) {
    const signin = await this.supabase.auth.signInWithPassword(
      {
        email: user.identifier,
        password:user.password
      }
    )
    if (signin.error || !signin.data) {
      throw new UnauthorizedException(`Invalid credential`)
    }
    return signin
  }
  async resendSignupEmailConfirmation(
    credential: Email,
  ) {
    try {
      const { data, error } =
        await this.supabase.auth.resend({
          type: 'signup',
          email: credential.email,
        })

      if (error) {
        throw new SupabaseException(
          "supabase",
          error,
          'Failed to resend email confirmation',
          500,
        )
      }

      if (!data) {
        throw new SupabaseException(
          "supabase",
          'Supabase returned no data',
          'Failed to resend email confirmation',
          500,
        )
      }

      return data
    } catch (err: unknown) {
      if (err instanceof AppException) {
        throw err
      }

      throw new RepositoryExceptions(
        'auth',
        err,
        'Failed to resend email confirmation',
        500,
      )
    }
  }
  async requestNewAccessToken(refresh_token: string) {
    try {
      const refreshed = await this.supabase.auth.refreshSession({
        refresh_token,
      });

      if (refreshed.error || !refreshed.data.session || !refreshed.data.user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return refreshed;
    } catch (err: unknown) {
      if (err instanceof AppException || err instanceof UnauthorizedException) {
        throw err;
      }

      throw new RepositoryExceptions(
        "auth",
        err,
        'Failed to refresh access token',
        500,
      );
    }
  }

  async signOut(access_token: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.admin.signOut(
        access_token,
        'local',
      );

      if (error) {
        throw new SupabaseException(
          "supabase",
          error,
          'Failed to sign out',
          error.status === 401 || error.status === 403 ? 401 : 500,
        );
      }
    } catch (err: unknown) {
      if (err instanceof AppException) {
        throw err;
      }

      throw new RepositoryExceptions('auth',err, 'Failed to sign out', 500);
    }
  }
}
