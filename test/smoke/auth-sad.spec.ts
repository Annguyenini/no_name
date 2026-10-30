import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';

describe('AppController (e2e)', () => {
  const legitEmail = "testtses111@gmail.com";
  const legitPassword = "KKIIk1123@";
  const invalid_legit_token = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjA2MTVjZGE3LWFlNWYtNGUyZi04ZWNhLTE4YjE0ZmNkNWQ1OSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F1dmNjb3N3eXp1em5lb2tqa2liLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2ZDUwNjQ4Zi0zMDdiLTQ0NGYtOTc3YS0wNTJkN2EzY2UxYTciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkzMTMyOTk0LCJpYXQiOjE3OTMxMjkzOTQsImVtYWlsIjoidGVzdHRzZXMxMTFAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InRlc3R0c2VzMTExQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjZkNTA2NDhmLTMwN2ItNDQ0Zi05NzdhLTA1MmQ3YTNjZTFhNyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzkzMTI5Mzk0fV0sInNlc3Npb25faWQiOiJlYmQ4MzUyMC1iZDJjLTRjMjktOGVhZS03MWVlYTYxMmMzMTUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.ofodLuG2oDUGEFZtAhRnk4httCHkwuiLH8pkr7g9nmKuas5lkKPjEoPgT4ZBIZoud7chiBnbNRDogZ5Kjr4HUw'
  let app: INestApplication<App>;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  describe('POST/sign-up', () => {
    it.each([
      ['invalid email', { email: 'dsdsdsdsdsd', password: 'dsdsdsd' }],
      ['weak password', { email: legitEmail, password: 'weak' }],
      ['missing password', { email: legitEmail }],
    ])('sign-up return 400 for %s', async (_senarios, body) => {
      await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send(body)
          .expect(400);
      });
    })
  describe('POST/sign-in', () => {
    it('wrong password ', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ identifier: legitEmail, password: 'Wrongpass11@' })
        .expect(401)
    })
    it.each([
      ['invalid inputs', { identifier: 'dsdsdsdsdsd', password: 'dsdsdsd' }],
      ['missing password', { identifier: legitEmail }],
    ])('sign-in return 401 for %s', async (_senarios, body) => {
      await request(app.getHttpServer())
          .post('/auth/sign-in')
          .send(body)
          .expect(400);
      });
    })
  describe('login via token', () => {
    it('should reject and return 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/sign-in-via-token')
        .expect(401)
    })
    it.each([
      ['invalid token', ''],
      ['invalid legit token',invalid_legit_token]
    ])('sign-in-via-token return 401 for %s', async (_senarios, body) => {
      await request(app.getHttpServer())
        .get('/auth/sign-in-via-token')
        .set('Authorization', body)
        .expect(401);
      });
    })
  describe('refresh-token', () => {
    it('should reject and return 401', async () => {
      await request(app.getHttpServer())
        .get('/auth/refresh-token')
        .expect(401)
    })
    it.each([
      ['invalid token', 'dsds'],
    ])('refresh-token return 401 for %s', async (_senarios, body) => {
      await request(app.getHttpServer())
        .get('/auth/refresh-token')
        .set("Authorization",body)

        .expect(401);
      });
    })
});
