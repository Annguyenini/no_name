export class SupabaseConfigDTO {
  constructor(
    public readonly SUPABASE_URL: string,
    public readonly SUPABASE_ANON_KEY: string,
  ) {}
}
