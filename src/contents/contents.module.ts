import { Module } from '@nestjs/common';
import { S3Module } from '../aws/s3/s3.module.js';
import { ContentsRepositoryService } from './contents.repository.service.js';
import { UploadRequests } from './contents-requests.service.js';
import { ConfigModule } from '../config/config.module.js';

@Module({
  providers: [ ContentsRepositoryService, UploadRequests],
  exports:[ContentsRepositoryService],
  imports:[S3Module,ConfigModule]
})
export class ContentsModule {}
