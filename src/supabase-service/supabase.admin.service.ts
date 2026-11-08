import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "./supabase.service.js";
import { SupportApp } from "aws-sdk";
import { Injectable, NotFoundException } from "@nestjs/common";
@Injectable()
export class SupabaseAdminService{
  private supabase_client:SupabaseClient
  constructor(private readonly supabase: SupabaseService) {
    this.supabase_client = this.supabase.getAdminClient()
  }
  async deleteUser(id:string) {
    const {error:delerror} = await this.supabase_client.auth.admin.deleteUser(id)
    if(delerror) throw delerror
  }
  async deleteUserByEmail(email: string) {
    const { data, error } = await this.supabase_client.auth.admin.listUsers()
    if (error) throw error
    const user = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
    if (!user) throw  new NotFoundException("User not found")
    const {error:delerror} = await this.supabase_client.auth.admin.deleteUser(user.id)
    if(delerror) throw delerror

  }
}
