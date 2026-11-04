import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types.js';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { relationship } from '../../src/generated/prisma/enums.js';
import type { RelationshipTestInput } from './1-relationship.js';

// -MIMO: Exercise the path where user 2 rejects user 1's incoming friend request.
export const senario2RelationshipTest = (inputs: RelationshipTestInput) => {
  return describe('Relationship e2e test - scenario 2 - user 1 sends - user 2 rejects', () => {
    let app: INestApplication<App>;
    let user_id_1: string;
    let user_id_2: string;
    let session_1: string;
    let session_2: string;

    const getRequestList = (path: string, session: string) => request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${session}`);

    beforeAll(async () => {
      const module_fixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
      app = module_fixture.createNestApplication();
      await app.init();

      const login_1 = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ identifier: inputs.email_1, password: inputs.password_1 })
        .expect(201);
      const login_2 = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ identifier: inputs.email_2, password: inputs.password_2 })
        .expect(201);

      const users = [
        { id: login_1.body.id as string, token: login_1.body.access_token as string },
        { id: login_2.body.id as string, token: login_2.body.access_token as string },
      ].sort((left, right) => left.id.localeCompare(right.id));
      [user_id_1, user_id_2] = [users[0].id, users[1].id];
      [session_1, session_2] = [users[0].token, users[1].token];
    });

    afterAll(async () => {
      await app?.close();
    });

    it('user 1 sends a friend request to user 2', async () => {
      const response = await request(app.getHttpServer())
        .post(`/relationships/friend-requests/${user_id_2}`)
        .set('Authorization', `Bearer ${session_1}`)
        .expect(201);
      const expected = [{
        id1: user_id_1,
        id2: user_id_2,
        status: relationship.request_from_1,
        last_update:expect.any(String)
        }]
      expect(response.body).toEqual(expect.arrayContaining(expected))
    });

    // -MIMO: Verify the sender can read the new request from the outgoing request list.
    it('user 1 can see user 2 in the sent requests list', async () => {
      const response = await getRequestList('/relationships/send-friend-requests', session_1).expect(200);
      expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({
        id1: user_id_1,
        id2: user_id_2,
        status: relationship.request_from_1,
      })]));
    });

    it('user 2 can see user 1 in incoming requests before rejecting', async () => {
      const response = await getRequestList('/relationships/received-friend-requests', session_2).expect(200);
      expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({
        id1: user_id_1,
        id2: user_id_2,
        status: user_id_1 < user_id_2 ? relationship.request_from_1 : relationship.request_from_2,
        last_update:expect.any(String)
      })]));
    });

    // -MIMO: Isolate rejection from follow-up list reads so each test makes one request.
    it('user 2 rejects user 1 request', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friend-requests/received/${user_id_1}`)
        .set('Authorization', `Bearer ${session_2}`)
        .expect(200, { count: 1 });
    });

    it('rejected user 2 should no longer appear in user 1 sent requests', async () => {
      const sent = await getRequestList('/relationships/send-friend-requests', session_1).expect(200);
      expect(sent.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id1: user_id_1, id2: user_id_2 })]));
    });

    it('rejected user 1 should no longer appear in user 2 received requests', async () => {
      const received = await getRequestList('/relationships/received-friend-requests', session_2).expect(200);
      expect(received.body).not.toEqual(expect.arrayContaining([expect.objectContaining({ id1: user_id_1, id2: user_id_2 })]));
    });
  });
};
