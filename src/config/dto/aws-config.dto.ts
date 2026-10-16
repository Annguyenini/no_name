// -MIMO: Carry AWS access credentials as a typed configuration value for AWS integrations.
export class AWSConfigDTO {
  constructor(
    public readonly AWS_ACCESS_KEY: string,
    public readonly AWS_SECRET_ACCESS_KEY: string,
  ) {}
}
