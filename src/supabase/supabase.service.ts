import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private instance: SupabaseClient;
  getClient() {
    if (this.instance) return this.instance
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_ANON_KEY!;
    this.instance = createClient(
      url,key
    )
    return this.instance
  }
}
