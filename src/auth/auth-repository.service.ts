import { SupabaseClient } from "@supabase/supabase-js";
import { SignUpDTO } from "./dto/signup.dto.js";
import { BadRequestException, InternalServerErrorException, UnauthorizedException,Injectable, Inject } from "@nestjs/common";
import { SignInDTO } from "./dto/signin.dto.js";
import { SupabaseService } from "../supabase-service/supabase.service.js";
import { AppException, RepositoryExceptions, SupabaseException, SystemException } from "../core/exceptions/app-exceptions.js";
import { Email } from "./dto/verify-email.sto.js";

// all request made to this point have to be verify their identities
@Injectable()
export class AuthRepositoryService{
  private supabase: SupabaseClient
  constructor(
    private readonly supabaseService: SupabaseService) {
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
        throw new BadRequestException("Email not good")
      }
      return user
      }

  catch(err) {
    throw err
    }
  }

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
      const { error } =
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
      return
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
