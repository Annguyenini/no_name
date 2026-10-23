import { Module } from '@nestjs/common';
import { S3Service } from './s3.service.js';
import { S3InstanceService } from './s3.instance.service.js';
import { ConfigService } from '../../config/config.service.js';
import { ConfigModule } from '../../config/config.module.js';

@Module({
  providers: [S3Service, S3InstanceService],
  exports: [S3Service, S3InstanceService],
  imports:[ConfigModule]
})
export class S3Module {

}
