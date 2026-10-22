import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service.js';
import { S3Module } from '../aws/s3/s3.module.js';

@Module({
  providers: [ContentsService],
  imports:[S3Module]
})
export class ContentsModule {}
