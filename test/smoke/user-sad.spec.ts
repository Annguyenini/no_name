import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';

describe('User sad cases', () => {
  const legitEmail = 'testtses111@gmail.com';
  const legitPassword = 'KKIIk1123@';
  const missing_profile_id = '00000000-0000-4000-8000-000000000001';
  let app: INestApplication<App>;
  let token: string;

  // -MIMO: Reuse one authenticated test session for user-route sad cases that require a valid bearer token.
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ identifier: legitEmail, password: legitPassword })
      .expect(201);

    expect(login.body.access_token).toBeDefined();
    token = login.body.access_token;
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('GET /users/user', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer()).get('/users/user').expect(401);
    });

    it('returns 400 when user_id is missing', async () => {
      await request(app.getHttpServer())
        .get('/users/user')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('returns 400 when user_id is not a UUID', async () => {
      await request(app.getHttpServer())
        .get('/users/user')
        .query({ user_id: 'not-a-uuid' })
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('returns 404 when the requested profile does not exist', async () => {
      await request(app.getHttpServer())
        .get('/users/user')
        .query({ user_id: missing_profile_id })
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('POST /users/create-profile', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer())
        .post('/users/create-profile')
        .send({ username: 'valid123', display_name: 'Test User' })
        .expect(401);
    });

    it.each([
      ['missing username', { display_name: 'Test User' }],
      ['invalid username', { username: 'bad-name', display_name: 'Test User' }],
      ['missing display name', { username: 'valid123' }],
    ])('returns 400 for %s', async (_scenario, body) => {
      await request(app.getHttpServer())
        .post('/users/create-profile')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(400);
    });
  });

  describe('PATCH /users/update-display-name', () => {
    it('returns 400 when display_name is missing', async () => {
      await request(app.getHttpServer())
        .patch('/users/update-display-name')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });

    it('returns 400 when display_name is not a string', async () => {
      await request(app.getHttpServer())
        .patch('/users/update-display-name')
        .set('Authorization', `Bearer ${token}`)
        .send({ display_name: 42 })
        .expect(400);
    });
  });
});
