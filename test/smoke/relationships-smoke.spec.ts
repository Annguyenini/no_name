import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';

// -MIMO: Smoke-check authentication, path validation, and expected results for every relationship endpoint.
describe('Relationships smoke checks', () => {
  const legit_email = 'testtses111@gmail.com';
  const legit_password = 'KKIIk1123@';
  const invalid_token = 'invalid-token';
  const malformed_user_id = 'not-a-uuid';
  const missing_user_id = '00000000-0000-4000-8000-000000000001';
  let app: INestApplication<App>;
  let access_token: string;
  let user_id: string;

  beforeAll(async () => {
    const module_fixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module_fixture.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ identifier: legit_email, password: legit_password })
      .expect(201);
    access_token = login.body.access_token;
    user_id = login.body.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  const read_routes = [
    ['friends', '/relationships/friends'],
    ['sent requests', '/relationships/send-friend-requests'],
    ['received requests', '/relationships/received-friend-requests'],
  ];

  describe.each(read_routes)('GET %s', (_label, path) => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer()).get(path).expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${invalid_token}`)
        .expect(401);
    });

    it('returns 200 with a valid token', async () => {
      await request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200);
    });
  });

  describe('POST /relationships/friend-requests/:target_user_id', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/${missing_user_id}`)
        .expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/${missing_user_id}`)
        .set('Authorization', `Bearer ${invalid_token}`)
        .expect(401);
    });

    it('returns 400 for a malformed target UUID', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/${malformed_user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when the user targets themself', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/${user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 404 when the target user does not exist', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/${missing_user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(404);
    });
  });

  describe('POST /relationships/friend-requests/received/:target_user_id/accept', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/received/${missing_user_id}/accept`)
        .expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/received/${missing_user_id}/accept`)
        .set('Authorization', `Bearer ${invalid_token}`)
        .expect(401);
    });

    it('returns 400 for a malformed sender UUID', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/received/${malformed_user_id}/accept`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when the user targets themself', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/received/${user_id}/accept`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when no incoming request exists', async () => {
      await request(app.getHttpServer())
        .post(`/relationships/friend-requests/received/${missing_user_id}/accept`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });
  });

  describe('DELETE /relationships/friend-requests/received/:target_user_id', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/received/${missing_user_id}`)
        .expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/received/${missing_user_id}`)
        .set('Authorization', `Bearer ${invalid_token}`)
        .expect(401);
    });

    it('returns 400 for a malformed sender UUID', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/received/${malformed_user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when the user targets themself', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/received/${user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when no incoming request exists', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/received/${missing_user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });
  });

  describe('DELETE /relationships/friend-requests/sent/:target_user_id', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/sent/${missing_user_id}`)
        .expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/sent/${missing_user_id}`)
        .set('Authorization', `Bearer ${invalid_token}`)
        .expect(401);
    });

    it('returns 400 for a malformed recipient UUID', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/sent/${malformed_user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when the user targets themself', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/sent/${user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when no outgoing request exists', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/sent/${missing_user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });
  });

  describe('DELETE /relationships/friends/:target_user_id', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friends/${missing_user_id}`)
        .expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friends/${missing_user_id}`)
        .set('Authorization', `Bearer ${invalid_token}`)
        .expect(401);
    });

    it('returns 400 for a malformed friend UUID', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friends/${malformed_user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when the user targets themself', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friends/${user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });

    it('returns 400 when no friendship exists', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friends/${missing_user_id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(400);
    });
  });
});
