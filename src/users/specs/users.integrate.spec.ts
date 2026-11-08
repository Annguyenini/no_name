import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../app.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SupabaseService } from '../../supabase-service/supabase.service.js';
import { ContentsRepositoryService } from '../../contents/contents.repository.service.js';

// -MIMO: Add HTTP integration coverage for the users guard, validation, controller, service, and repository flow.
describe('Users integration', () => {
  let app: INestApplication<App>;
  let supabase_client: { auth: { getUser: ReturnType<typeof vi.fn> } };
  let prisma_service: {
    users: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let contents_repository: {
    getContentAccessUrl: ReturnType<typeof vi.fn>;
    requestUploadUrl: ReturnType<typeof vi.fn>;
    verifyUploadRequest: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    supabase_client = { auth: { getUser: vi.fn() } };
    prisma_service = {
      users: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };
    contents_repository = {
      getContentAccessUrl: vi.fn(),
      requestUploadUrl: vi.fn(),
      verifyUploadRequest: vi.fn(),
    };

    const module_fixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseService)
      .useValue({
        getClient: () => supabase_client,
        getAdminClient: () => supabase_client,
      })
      .overrideProvider(PrismaService)
      .useValue(prisma_service)
      .overrideProvider(ContentsRepositoryService)
      .useValue(contents_repository)
      .compile();

    app = module_fixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    supabase_client.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'person@example.com' } },
      error: null,
    });
    contents_repository.getContentAccessUrl.mockResolvedValue(
      'https://example.test/avatar',
    );
    contents_repository.requestUploadUrl.mockResolvedValue(
      'https://example.test/avatar-upload',
    );
    contents_repository.verifyUploadRequest.mockResolvedValue(null);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/me', () => {
    it('returns the authenticated user profile', async () => {
      const profile = {
        id: 'user-1',
        username: 'person1',
        display_name: 'Person One',
        status: 'active',
        avatar_properties: null,
      };
      prisma_service.users.findUnique.mockResolvedValue(profile);

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
        .expect(profile);
      expect(prisma_service.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('rejects requests without a bearer token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
      expect(prisma_service.users.findUnique).not.toHaveBeenCalled();
    });

    it('returns 404 when the authenticated user profile does not exist', async () => {
      prisma_service.users.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });

  describe('GET /users/user', () => {
    it('returns only the public profile fields', async () => {
      prisma_service.users.findUnique.mockResolvedValue({
        id: 'user-2',
        username: 'person2',
        display_name: 'Person Two',
        status: 'active',
        avatar_properties: { private: true },
      });

      await request(app.getHttpServer())
        .get('/users/user')
        .query({ user_id: '22222222-2222-4222-8222-222222222222' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
        .expect({
          id: 'user-2',
          username: 'person2',
          display_name: 'Person Two',
        });
    });

    it('rejects a non-UUID user ID before querying the repository', async () => {
      await request(app.getHttpServer())
        .get('/users/user')
        .query({ user_id: 'not-a-uuid' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
      expect(prisma_service.users.findUnique).not.toHaveBeenCalled();
    });

    it('returns 404 when the requested profile does not exist', async () => {
      prisma_service.users.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/users/user')
        .query({ user_id: '22222222-2222-4222-8222-222222222222' })
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });

  describe('POST /users/create-profile', () => {
    it('creates a profile for the authenticated user', async () => {
      prisma_service.users.findUnique.mockResolvedValue(null);
      prisma_service.users.create.mockImplementation(async ({ data }) => ({
        ...data,
        avatar_properties: null,
      }));

      await request(app.getHttpServer())
        .post('/users/create-profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ username: 'person1', display_name: 'Person One' })
        .expect(201)
        .expect({
          id: 'user-1',
          username: 'person1',
          display_name: 'Person One',
          status: 'active',
          avatar_properties: null,
        });
      expect(prisma_service.users.create).toHaveBeenCalledWith({
        data: {
          id: 'user-1',
          username: 'person1',
          display_name: 'Person One',
          status: 'active',
        },
      });
    });

    it('rejects usernames outside the DTO rules', async () => {
      await request(app.getHttpServer())
        .post('/users/create-profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ username: 'bad', display_name: 'Person One' })
        .expect(400);
      expect(prisma_service.users.findUnique).not.toHaveBeenCalled();
    });

    it('returns 409 when the authenticated user already has a profile', async () => {
      prisma_service.users.findUnique.mockResolvedValue({
        id: 'user-1',
        username: 'person1',
        display_name: 'Person One',
        status: 'active',
        avatar_properties: null,
      });

      await request(app.getHttpServer())
        .post('/users/create-profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ username: 'person2', display_name: 'Person Two' })
        .expect(409);
      expect(prisma_service.users.create).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /users/update-display-name', () => {
    it('updates the authenticated user display name', async () => {
      prisma_service.users.update.mockResolvedValue({
        id: 'user-1',
        username: 'person1',
        display_name: 'New Name',
        status: 'active',
        avatar_properties: null,
      });

      await request(app.getHttpServer())
        .patch('/users/update-display-name')
        .set('Authorization', 'Bearer valid-token')
        .send({ display_name: 'New Name' })
        .expect(200)
        .expect({
          id: 'user-1',
          username: 'person1',
          display_name: 'New Name',
          status: 'active',
          avatar_properties: null,
        });
      expect(prisma_service.users.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { display_name: 'New Name' },
      });
    });

    it.each([
      ['missing display name', {}],
      ['non-string display name', { display_name: 123 }],
      [
        'unknown body field',
        { display_name: 'New Name', user_id: 'another-user' },
      ],
    ])('rejects %s', async (_scenario, body) => {
      await request(app.getHttpServer())
        .patch('/users/update-display-name')
        .set('Authorization', 'Bearer valid-token')
        .send(body)
        .expect(400);
      expect(prisma_service.users.update).not.toHaveBeenCalled();
    });
  });

  describe('GET /users/me/avatar', () => {
    it('returns an access URL for the authenticated user avatar', async () => {
      await request(app.getHttpServer())
        .get('/users/me/avatar')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
        .expect({ url: 'https://example.test/avatar' });
      expect(contents_repository.getContentAccessUrl).toHaveBeenCalledWith(
        expect.any(Object),
        300,
      );
    });
  });

  describe('PATCH /users/avatar/validate-upload', () => {
    it('returns 400 when the authenticated user has no verified avatar upload', async () => {
      await request(app.getHttpServer())
        .patch('/users/avatar/validate-upload')
        .set('Authorization', 'Bearer valid-token')
        .send({ width: 100, height: 100 })
        .expect(400);
      expect(prisma_service.users.update).not.toHaveBeenCalled();
    });
  });
});
