import { Module } from '@nestjs/common';
import { S3Service } from './s3.service.js';
import { S3InstanceService } from './s3.instance.service.js';

@Module({
  providers: [S3Service, S3InstanceService],
  exports:[S3Service,S3InstanceService]
})
export class S3Module {

}
