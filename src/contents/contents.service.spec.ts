import { Test, TestingModule } from '@nestjs/testing';
import { ContentsService } from './contents.service.js';
import { S3Service } from '../aws/s3/s3.service.js';

describe('ContentsService', () => {
  let service: ContentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentsService,{provide:S3Service,useValue:{}}],
    }).compile();

    service = module.get<ContentsService>(ContentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
