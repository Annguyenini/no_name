# Configuration

The application reads configuration values from environment variables.

## AWS credentials

Set `AWS_ACCESS_KEY` and `AWS_SECRET_ACCESS_KEY` for integrations that use AWS. The `ConfigService.getAwsConfig()` method returns both values as an `AWSConfigDTO` and throws an error if either value is missing. These credentials are read on demand, so unrelated application startup does not require them.

Use `.env.example` as a key list; keep real credentials in a local environment file or secret manager and do not commit them.
