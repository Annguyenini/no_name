import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDTO } from './dto/signin.dto.js';
import { AuthRepositoryService } from './auth-repository.service.js';
import { SignInResponseDTO } from './dto/signin-response.dto.js';
import { SignUpDTO } from './dto/signup.dto.js';
import { SignUpResponseDTO } from './dto/signup-response.dto.js';
import { User } from '@supabase/supabase-js';
import { UserDTO } from '../users/dto/user.dto.js';
import { VerifyEmailDTO } from './dto/verify-email.sto.js';

@Injectable()
export class AuthService {
  constructor(private readonly auth_repository: AuthRepositoryService) { }
  async signIn(user: SignInDTO):Promise<SignInResponseDTO> {
    const signIn = await this.auth_repository.signIn(user)
    const response = new SignInResponseDTO()
    response.id = signIn.data.user.id
    response.access_token = signIn.data.session.access_token
    response.refresh_token = signIn.data.session.refresh_token
    return response
  }
  async signUp(user: SignUpDTO) {
    const signUp = await this.auth_repository.signUp(user)
    const response = new SignUpResponseDTO()
    if (!signUp.data.user) {
      throw new UnauthorizedException("Failed to signup")
    }
    response.id = signUp.data.user.id
    return response
  }
  // async completeSignUp(user: UserDTO) {
  //   try {
  //     const completeSignUp = await this.auth_repository.completeSignUp(user)
  //     return completeSignUp
  //   }
  //   catch (err) {
  //     throw err
  //   }
  // }
  // async emailVerification(body:VerifyEmailDTO) {
  //   const verify = await this.auth_repository.emailVerification(body.email, body.token  )
  //   const response = new SignInResponseDTO()
  //   if (!verify.data.user || !verify.data.session) {
  //     throw new UnauthorizedException("Failed to verify")
  //   }
  //   response.id = verify.data.user.id
  //   response.access_token = verify.data.session.access_token
  //   response.refresh_token = verify.data.session.refresh_token
  //   return response
  // }

}
