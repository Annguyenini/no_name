import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '../config/config.service.js';

@Injectable()
export class SupabaseService {
  private instance: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  getClient() {
    if (this.instance) return this.instance
    const { SUPABASE_URL, SUPABASE_ANON_KEY } =
      this.configService.getSupabaseConfig();
    this.instance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return this.instance
  }


}
