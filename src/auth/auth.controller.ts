import { Body, Controller, Get, UseInterceptors } from '@nestjs/common';
import { JwtSupabaseStrategy } from './jwt.strategy.js';
import { AllExceptionsHandler } from '../interceptors/all-exceptions-handler.intercept.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { SignInDTO } from './dto/signin.dto.js';
import { SignUpDTO } from './dto/signup.dto.js';
import { VerifyEmailDTO } from './dto/verify-email.sto.js';

@Controller('auth')
export class AuthController {
  constructor (private readonly auth_service:AuthService){}
  // sign up\
  @Get("/auth/signup")
  @UseInterceptors(AllExceptionsHandler)
  async signUp(@Body() user: SignUpDTO){
    return await this.auth_service.signUp(user)
  }
  @Get("/auth/verify-email")
  @UseInterceptors(AllExceptionsHandler)
  async verifyEmail(@Body() body:VerifyEmailDTO){
    return await this.auth_service.emailVerification(body)
  }
  //Sign in
  @Get("/auth/signin")
  @UseInterceptors(AllExceptionsHandler)
  async signIn(@Body() user: SignInDTO) {
    return await this.auth_service.signIn(user)
  }
}
