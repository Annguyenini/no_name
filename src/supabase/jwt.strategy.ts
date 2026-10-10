import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Strategy } from 'passport-custom';
import { jwtConstants } from '../auth/constants.js';
import { Request } from "express";
import { PassportStrategy } from '@nestjs/passport';
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "./supabase.service.js";

@Injectable()
export class JwtSupabaseStrategy extends PassportStrategy(Strategy,'jwt') {
  private supabase: SupabaseClient

  constructor(
    private readonly supabaseService: SupabaseService) {

      super();

    this.supabase = this.supabaseService.getClient()

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
