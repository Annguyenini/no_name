import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { S3Service } from '../../src/aws/s3/s3.service.js';
import { S3InstanceService } from '../../src/aws/s3/s3.instance.service.js';
import { config_instance, ConfigService } from '../../src/config/config.service.js';
import { ConfigModule } from '../../src/config/config.module.js';

describe('User sad cases', () => {
  let app: INestApplication<App>;
  let s3: S3InstanceService
  let s3_client:S3Client
  // -MIMO: Reuse one authenticated test session for user-route sad cases that require a valid bearer token.
  beforeAll(async () => {
    const config = new ConfigService()
    s3 = new S3InstanceService(config)
    s3_client= s3.getClient()
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule,ConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('S3 connection', () => {
    it('check s3 connection', async () => {
       const result = await s3_client.send(new HeadBucketCommand({ Bucket: config_instance.getAwsConfig().AWS_BUCKET }));
       console.log(request)
    })
  })

});
