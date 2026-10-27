
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const legitEmail = "testtses111@gmail.com";
  const legitPassword = "KKIIk1123@";
  let username: string;
  let display_name: string;
  let access_token: string;

  // -MIMO: Keep the integration flow repeatable with the provisioned test account and current API routes.
  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 15000);

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /auth/sign-up', () => {
    it('should reject invalid signup input', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-up')
        .send({
          email: legitEmail,
          password: legitPassword,
        });

      expect(res.status).toBe(201);
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
    it('should create a profile when missing or reuse the existing test profile', async () => {
      const auth_header = `Bearer ${access_token}`;
      const existing_profile = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', auth_header);

      if (existing_profile.status === 200) {
        username = existing_profile.body.username;
        display_name = existing_profile.body.display_name;
      } else {
        expect(existing_profile.status).toBe(404);
        username = `E2E${Date.now().toString(36).slice(-7)}`;
        display_name = `E2E profile ${Date.now()}`;

        const created_profile = await request(app.getHttpServer())
          .post('/users/create-profile')
          .set('Authorization', auth_header)
          .send({ username, display_name });

        expect(created_profile.status).toBe(201);
        expect(created_profile.body.id).toBeDefined();
        expect(created_profile.body.username).toBe(username);
        expect(created_profile.body.display_name).toBe(display_name);
        expect(created_profile.body.status).toBeDefined();
      }
    });
  });

  describe('Avatar upload flow', () => {
    it('should upload an image to S3 and validate it', async () => {
      // 1. Request a presigned URL
      const urlResponse = await request(app.getHttpServer())
        .get('/users/avatar/upload-url')
        .set("Authorization",`Bearer ${access_token}`)
        .expect(200);

      expect(urlResponse.body.url).toBeDefined();
      // 2. Read the test image
      const imageBuffer = fs.readFileSync(
        fileURLToPath(new URL('./images/stock-image.jpeg', import.meta.url)),
      );

      expect(imageBuffer.length).toBeGreaterThan(0);

      // 3. Upload the image directly to S3
      const upload_response = await fetch(urlResponse.body.url, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: imageBuffer,
      });
      expect(upload_response.status).toBe(200);

      // 4. Validate the uploaded image through your API
      await request(app.getHttpServer())
        .patch('/users/avatar/validate-upload')
        .set("Authorization",`Bearer ${access_token}`)
        .send({ content_type: 'image/jpeg', size: imageBuffer.length })
        .expect(200);
    },25000);
  });
  describe("get user data", () => {
    it("Should return user data that match the sending user data", async () => {
      const user_data = await request(app.getHttpServer())
        .get('/users/me')
        .set("Authorization",`Bearer ${access_token}`)
        .expect(200);
      expect(user_data.body.username).toBeDefined()
      expect(user_data.body.id).toBeDefined()
      expect(user_data.body.display_name).toBeDefined()
      expect(user_data.body.status).toBeDefined()
      expect(user_data.body.username).toBe(username);
      expect(user_data.body.display_name).toBe(display_name);
      expect(user_data.body.status).toBe('active');
    })
  })

})
