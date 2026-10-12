import { Body, Controller, Get, Post, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AllExceptionsHandler } from '../interceptors/all-exceptions-handler.intercept.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { SignInDTO } from './dto/signin.dto.js';
import { SignUpDTO } from './dto/signup.dto.js';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseGuard } from '../supabase/supabase.guard.js';
import { Email } from './dto/verify-email.sto.js';

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
  @Post("/signup")
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
  @Post("/signin")
  @UseFilters(AllExceptionsHandler)
  async signIn(@Body() user: SignInDTO) {
    console.log(user)
    return await this.auth_service.signIn(user)
  }

  @Post("/resend-email-verification")
  @UseFilters(AllExceptionsHandler)
  async resend(@Body() email:Email) {
    return await this.auth_service.resendEmailConfirmation(email)
  }
  @UseGuards(SupabaseGuard)
  @Get("/test")
  @UseFilters(AllExceptionsHandler)
  async test() {
  }


}
