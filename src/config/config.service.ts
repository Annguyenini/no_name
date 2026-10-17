import { Injectable } from '@nestjs/common';
import { DatabaseConfigDTO } from './dto/database-config.dto.js';
import { SupabaseConfigDTO } from './dto/supabase-config.dto.js';
import { AWSConfigDTO } from './dto/aws-config.dto.js';

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

  // -MIMO: Read and validate AWS credentials on demand for services that integrate with AWS.
  getAwsConfig(): AWSConfigDTO {
    const aws_access_key = process.env.AWS_ACCESS_KEY;
    const aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;

    if (!aws_access_key || !aws_secret_access_key) {
      throw new Error(
        'AWS_ACCESS_KEY and AWS_SECRET_ACCESS_KEY must be set in the environment',
      );
    }

    return new AWSConfigDTO(aws_access_key, aws_secret_access_key);
  }
}
