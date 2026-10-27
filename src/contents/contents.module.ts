import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service.js';
import { S3Module } from '../aws/s3/s3.module.js';
import { ContentsRepositoryService } from './contents.repository.service.js';
import { UploadRequests } from './contents-requests.service.js';

@Module({
  providers: [ContentsService, ContentsRepositoryService, UploadRequests],
  exports:[ContentsService,ContentsRepositoryService],
  imports:[S3Module]
})
export class ContentsModule {}
