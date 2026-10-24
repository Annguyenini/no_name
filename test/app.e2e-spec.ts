
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let avatarUrl: string;

  const legitEmail = process.env.LEGIT_EMAIL_TEST;
  const legitPassword = process.env.LEGIT_PASSWORD_TEST;
  let access_token:string
  beforeAll(async () => {
    if (!legitEmail || !legitPassword) {
      throw new Error('Missing test credentials in environment variables');
    }

    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /auth/sign-up', () => {
    it('should create a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: legitEmail,
          password: legitPassword,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
    });
  });

  describe('POST /auth/sign-in', () => {
    it('should sign in the user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          identifier: legitEmail,
          password: legitPassword,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.access_token).toBeDefined();
      expect(res.body.refresh_token).toBeDefined();
      access_token = res.body.access_token
    });
  });

  describe('POST /users/create-profile', () => {
    it('should create a profile', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/create-profile')
        .set("Authorization",`Bearer ${access_token}`)
        .send({
          username: 'Nanssesn8g',
          display_name: 'Nananana',
        });
      console.log(res)
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.username).toBeDefined();
      expect(res.body.display_name).toBeDefined();
      expect(res.body.avatar_url).toBeDefined();
      expect(res.body.status).toBeDefined();
    });
    15000
  });

  describe('Avatar upload flow', () => {
    it('should upload an image to S3 and validate it', async () => {
      // 1. Request a presigned URL
      const urlResponse = await request(app.getHttpServer())
        .get('/users/avatar/upload-url')
        .set("Authorization",`Bearer ${access_token}`)
        .expect(200);

      expect(urlResponse.body.url).toBeDefined();
      avatarUrl = urlResponse.body.url;
      console.log(avatarUrl)
      // 2. Read the test image
      const imageBuffer = fs.readFileSync(
        path.join(__dirname, 'images', 'stock-image.jpeg'),
      );

      expect(imageBuffer.length).toBeGreaterThan(0);

      // 3. Upload the image directly to S3
      await request(avatarUrl)
        .put('')
        .set('Content-Type', 'image/jpeg')
        .send(imageBuffer)
        .expect(200);

      // 4. Validate the uploaded image through your API
      // Replace the payload with the fields your endpoint expects.
      await request(app.getHttpServer())
        .patch('/users/avatar/validate-upload')
        .set("Authorization",`Bearer ${access_token}`)
        .send({ avatar_url: avatarUrl })
        .expect(200);
    },25000);

  });
});
