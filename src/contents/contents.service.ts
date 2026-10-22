import { Injectable } from '@nestjs/common';
import { S3Service } from '../aws/s3/s3.service.js';
import { ContentsRepositoryService } from './contents.repository.service.js';
import { BaseContentDTO } from './dto/content.dto.js';
@Injectable()
export class ContentsService {
  constructor(private readonly s3_service: S3Service,
    private readonly contents_repository: ContentsRepositoryService) { }


}
