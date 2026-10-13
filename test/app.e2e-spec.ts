import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
<<<<<<< HEAD
  var legit_email = "testvl@gmail.com"
  var legit_password = "Testing11234@"
=======
  var legit_email = process.env.LEGIT_EMAIL_TEST
  var legit_password = process.env.LEGIT_PASSWORD_TEST
>>>>>>> fd4444f (auth e2e test)
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  describe('POST/signup', () => {
    it('Should return 400', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({"email":"dsdsdsd",
            "password":"dsdsdsds"})
        .expect(400)

    })
  })
  describe('POST/signup', () => {
    it('Should create a new user ', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({"email":legit_email,
            "password":legit_password})
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined()
        })
    })
  })

  describe('POST/signin', () => {
    it('Should return 400', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({"identifier":"dsdsdsd",
            "password":"dsdsdsds"})
        .expect(400)

    })
  })
  describe('POST/signin', () => {
    it('Should create a new user ', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({"identifier":legit_email,
            "password":legit_password})
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined()
        })
    })
  })
  describe('POST/signin', () => {
    it('Should return 401', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({"identifier":legit_email,
            "password":"OigioiOi112ww@"})
        .expect(401)

    })
  })

});
