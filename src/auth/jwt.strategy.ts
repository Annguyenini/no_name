import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants.js';
import { Request } from "express";
import { PassportStrategy } from '@nestjs/passport';
import { SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class JwtSupabaseStrategy extends PassportStrategy(Strategy) {

  constructor(private readonly supabase : SupabaseClient) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
    })
  }
  // only return id and email
  async validate(request:Request) {

    try {
      const authorization = request.headers.authorization
      if (!authorization?.startsWith("Bearer ")) {
        throw new UnauthorizedException("Missing Token")
      }
      const token = authorization.slice(7)
      const user = await this.supabase.auth.getUser(token)
      if (user.error || !user.data) {
        throw new UnauthorizedException("Invalid Token")
      }
      return {
        id: user.data.user.id,
        email: user.data.user.email
      }
    }
    catch (err) {
      throw new Error(`Failed to validate token: ${err}`)
    }
   }
}
