import { Injectable } from '@nestjs/common';
import { DatabaseConfigDTO } from './dto/database-config.dto.js';
import { SupabaseConfigDTO } from './dto/supabase-config.dto.js';

@Injectable()
export class ConfigService {
  getDatabaseConfig(): DatabaseConfigDTO {
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL must be set in the environment');
    }

    return new DatabaseConfigDTO(databaseUrl, directUrl);
  }

  getSupabaseConfig(): SupabaseConfigDTO {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_ANON_KEY must be set in the environment',
      );
    }

    return new SupabaseConfigDTO(supabaseUrl, supabaseAnonKey);
  }
}
