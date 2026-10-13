export class DatabaseConfigDTO {
  constructor(
    public readonly DATABASE_URL: string,
    public readonly DIRECT_URL: string | undefined,
  ) {}
}
