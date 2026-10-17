import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service.js';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns AWS credentials from the environment', () => {
    vi.stubEnv('AWS_ACCESS_KEY', 'test-access-key');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-secret-key');

    expect(service.getAwsConfig()).toEqual({
      AWS_ACCESS_KEY: 'test-access-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret-key',
    });

    vi.unstubAllEnvs();
  });

  it('requires both AWS credentials when AWS config is requested', () => {
    vi.stubEnv('AWS_ACCESS_KEY', '');
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', '');

    expect(() => service.getAwsConfig()).toThrow(
      'AWS_ACCESS_KEY and AWS_SECRET_ACCESS_KEY must be set in the environment',
    );

    vi.unstubAllEnvs();
  });
});
// -MIMO: Cover AWS configuration parsing and validation in the config service unit tests.
