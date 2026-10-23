import { Body, Controller, Get, Headers, Post, Req, UnauthorizedException, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import type { Request } from "express";
import { AllExceptionsHandler } from '../interceptors/all-exceptions-handler.intercept.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { SignInDTO } from './dto/signin.dto.js';
import { SignUpDTO } from './dto/signup.dto.js';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseGuard } from '../supabase/supabase.guard.js';
import { Email } from './dto/verify-email.sto.js';
import type{ AuthenticatedRequest } from '../core/global-types/authenticated-user.js';
import { AppException } from '../core/exceptions/app-exceptions.js';

@Controller('auth')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform:true
    }),
)
export class AuthController {
  constructor (private readonly auth_service:AuthService){}
  // sign up\
  @Post("/sign-up")
  @UseFilters(AllExceptionsHandler)
  async signUp(@Body() user: SignUpDTO){
    return await this.auth_service.signUp(user)
  }
  // @Post("/verify-email")
  // @UseInterceptors(AllExceptionsHandler)
  // async verifyEmail(@Body() body:VerifyEmailDTO){
  //   return await this.auth_service.emailVerification(body)
  // }
  //Sign in
  @Post("/sign-in")
  @UseFilters(AllExceptionsHandler)
  async signIn(@Body() user: SignInDTO) {
    return await this.auth_service.signIn(user)
  }

  @Get('/refresh-token')
  @UseFilters(AllExceptionsHandler)
  // -MIMO: Read the refresh credential from the bearer header and reject missing or malformed credentials.
  async refreshToken(@Headers('authorization') authorization: string | undefined) {
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    const refresh_token = match?.[1]?.trim();
    if (!refresh_token) throw new UnauthorizedException('Missing or invalid refresh token');

    return this.auth_service.requestNewAccessToken(refresh_token);
  }

  @Post('/signout')
  @UseGuards(SupabaseGuard)
  @UseFilters(AllExceptionsHandler)
  async signOut(@Req() request: Request) {
    const access_token = request.headers.authorization!.slice(7);
    return this.auth_service.signOut(access_token);
  }

  @Post("/resend-email-verification")
  @UseFilters(AllExceptionsHandler)
  async resend(@Body() email:Email) {
    return await this.auth_service.resendEmailConfirmation(email)
  }
  @UseGuards(SupabaseGuard)
  @Get("/test")
  @UseFilters(AllExceptionsHandler)
  async test(@Req() request: AuthenticatedRequest) {
    throw new AppException('auth',"testting","testting",500)
  }


}
