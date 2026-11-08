import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AvatarUploadObject } from '../aws/s3/s3.object.js';
import { S3Service } from '../aws/s3/s3.service.js';
import { ContentsRepositoryService } from './contents.repository.service.js';
import { UploadRequests } from './contents-requests.service.js';

// -MIMO: Group content repository verification coverage under the method being tested.
describe('ContentsRepositoryService', () => {
  const object = new AvatarUploadObject('user-1');
  let upload_requests: UploadRequests;
  let get_object_data: ReturnType<typeof vi.fn>;
  let repository: ContentsRepositoryService;

  beforeEach(() => {
    upload_requests = new UploadRequests();
    get_object_data = vi.fn();
    const s3_service = {
      generateUploadUrl: vi.fn().mockResolvedValue('https://upload.example'),
      getObjectData: get_object_data,
    } as unknown as S3Service;
    repository = new ContentsRepositoryService(s3_service, upload_requests);
  });

  describe('verifyUploadRequest', () => {
    it('tracks a generated upload and consumes its valid object', async () => {
      await repository.requestUploadUrl('user-1', object);
      get_object_data.mockResolvedValue({
        ContentLength: 1024,
        ContentType: 'image/jpeg',
      });

      const result = await repository.verifyUploadRequest('user-1', object);

      expect(result.ContentLength).toBe(1024);
      expect(
        upload_requests.getObjectFromMap(object.getUploadObject().key),
      ).toBeUndefined();
    });

    it('rejects a request owned by another user', async () => {
      await repository.requestUploadUrl('user-1', object);

      await expect(
        repository.verifyUploadRequest('user-2', object),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(get_object_data).not.toHaveBeenCalled();
    });

    it('rejects verification when no upload request is pending', async () => {
      await expect(
        repository.verifyUploadRequest('user-1', object),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(get_object_data).not.toHaveBeenCalled();
    });

    it('rejects an expired upload request without checking S3', async () => {
      const upload = object.getUploadObject();
      upload_requests.addObjectIntoMap(upload.key, {
        user_id: 'user-1',
        key: upload.key,
        content_type: upload.content_type,
        expire_at: Date.now() - 1,
      });

      await expect(
        repository.verifyUploadRequest('user-1', object),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(get_object_data).not.toHaveBeenCalled();
    });

    it('rejects verification when the uploaded object is missing', async () => {
      await repository.requestUploadUrl('user-1', object);
      get_object_data.mockResolvedValue(null);

      await expect(
        repository.verifyUploadRequest('user-1', object),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(
        upload_requests.getObjectFromMap(object.getUploadObject().key),
      ).toBeDefined();
    });

    it('rejects an object that exceeds the configured maximum size', async () => {
      await repository.requestUploadUrl('user-1', object);
      get_object_data.mockResolvedValue({
        ContentLength: object.getUploadObject().max_content_size + 1,
        ContentType: 'image/jpeg',
      });

      await expect(
        repository.verifyUploadRequest('user-1', object),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an empty uploaded object', async () => {
      await repository.requestUploadUrl('user-1', object);
      get_object_data.mockResolvedValue({
        ContentLength: 0,
        ContentType: 'image/jpeg',
      });

      await expect(
        repository.verifyUploadRequest('user-1', object),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an object with a different content type', async () => {
      await repository.requestUploadUrl('user-1', object);
      get_object_data.mockResolvedValue({
        ContentLength: 1024,
        ContentType: 'image/png',
      });

      await expect(
        repository.verifyUploadRequest('user-1', object),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
