import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service.js';
import { S3InstanceService } from './s3.instance.service.js';

// -MIMO: Supply the S3 client provider so the service definition test can construct S3Service in isolation.
describe('S3Service', () => {
  let service: S3Service;
  let s3_instance_service: { getClient: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    s3_instance_service = { getClient: vi.fn().mockReturnValue({ send: vi.fn() }) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3Service, { provide: S3InstanceService, useValue: s3_instance_service }],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
