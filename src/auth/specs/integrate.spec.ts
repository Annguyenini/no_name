import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../../app.module.js';
import { SupabaseService } from '../../supabase-service/supabase.service.js';

describe('AppController (e2e)', () => {
  const legitEmail = "testtses111@gmail.com";
  const legitPassword = "Oigioioi1123@";
  const invalid_legit_token = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjA2MTVjZGE3LWFlNWYtNGUyZi04ZWNhLTE4YjE0ZmNkNWQ1OSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F1dmNjb3N3eXp1em5lb2tqa2liLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2ZDUwNjQ4Zi0zMDdiLTQ0NGYtOTc3YS0wNTJkN2EzY2UxYTciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkzMTMyOTk0LCJpYXQiOjE3OTMxMjkzOTQsImVtYWlsIjoidGVzdHRzZXMxMTFAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6InRlc3R0c2VzMTExQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjZkNTA2NDhmLTMwN2ItNDQ0Zi05NzdhLTA1MmQ3YTNjZTFhNyJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzkzMTI5Mzk0fV0sInNlc3Npb25faWQiOiJlYmQ4MzUyMC1iZDJjLTRjMjktOGVhZS03MWVlYTYxMmMzMTUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.ofodLuG2oDUGEFZtAhRnk4httCHkwuiLH8pkr7g9nmKuas5lkKPjEoPgT4ZBIZoud7chiBnbNRDogZ5Kjr4HUw'
  let app: INestApplication<App>;
  let supabase_client: {
    auth: {
      signInWithPassword: ReturnType<typeof vi.fn>
      signUp: ReturnType<typeof vi.fn>
      getUser: ReturnType<typeof vi.fn>
      refreshSession:ReturnType<typeof vi.fn>
    }
  }

  beforeAll(async () => {
    supabase_client = {
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        getUser: vi.fn(),
        refreshSession:vi.fn()
      },
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(SupabaseService)
      .useValue({
        getClient: () => supabase_client,
        getAdminClient: () => supabase_client})
      .compile();

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
    it('successfully signup', async () => {
      supabase_client.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-1' },
          session: {
            access_token: 'access-1',
            refresh_token: 'refresh-1',
          },
        },
        error: null,
      })
      await request(app.getHttpServer())
          .post('/auth/sign-up')
          .send({ email: 'person@example.com', password: 'Password11!' })
        .expect(201)
        .expect({
          id: 'user-1',
        })
      expect(supabase_client.auth.signUp).toHaveBeenCalledWith({
        email: "person@example.com",
        password:"Password11!"
      })
    })
    })

  describe('POST/sign-in', () => {
    it('wrong password ', async () => {
      supabase_client.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-1' },
          session: {
            access_token: 'access-1',
            refresh_token: 'refresh-1',
          },
        },
        error: null,
      })
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ identifier: legitEmail, password: legitPassword })
        .expect(201)
        .expect({
           id: 'user-1',
            access_token: 'access-1',
            refresh_token: 'refresh-1',
        })
      expect(supabase_client.auth.signInWithPassword).toHaveBeenCalledWith({
          email: legitEmail,
          password:legitPassword
      })
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
    it('success singin ', async () => {
      supabase_client.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: 'wrror',
      })
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ identifier: legitEmail, password: 'Wrongpass11@' })
        .expect(401)
      expect(supabase_client.auth.signInWithPassword).toHaveBeenCalledWith({
          email: legitEmail,
          password:'Wrongpass11@'
      })
    })
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
    it('should return 200', async () => {
      supabase_client.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-1',
            email:'person@gmail.com'
          }
        },
        error:null
      })
      await request(app.getHttpServer())
        .get('/auth/sign-in-via-token')
        .set('Authorization', 'Bearer test')
        .expect(200)
        .expect({
          user_id:'user-1'
        })
    })
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
  it('should accept and return new access token and refresh token', async () => {
    supabase_client.auth.refreshSession.mockResolvedValue({
      data: {
        user: {
          id:'user-1'
        },
        session: {
          access_token: 'new access token',
          refresh_token: 'new refresh token'
        }
      },
      error:null
    })
    await request(app.getHttpServer())
      .get('/auth/refresh-token')
      .set("Authorization", 'Bearer testdsdsdsdsdsdsdsdsdsdsd2222')
      .set("authorization",'Bearer testdsdsdsdsdsdsdsdsdsdsd2222')
      .expect(200)
      .expect({id:'user-1',access_token:"new access token",refresh_token:"new refresh token"})
  })
});
