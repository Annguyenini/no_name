import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module.js";
import request from 'supertest';
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types.js";
import { relationship } from "../../src/generated/prisma/enums.js";





export interface RelationshipTestInput {
  email_1: string,
  email_2: string,
  password_1: string,
  password_2:string
}
// maintain 2 active sessions for 2 mock users, using them to test for feature
export const senario1RelationshipTest = (inputs:RelationshipTestInput) => {
  return describe("Relationship e2e test - senario 1 - user 1 send - user 2 accept", () => {
  const email_1 = inputs.email_1
  const password_1 = inputs.password_1
  const email_2 = inputs.email_2
  const password_2 = inputs.password_2

  // user_ids will be replace with sorted order
  let user_id_1:string
  let user_id_2:string
  let app: INestApplication<App>;
  let session_1:string
  let session_2:string
  const sendFriendRequest = async (recipientId: string, session: string) => {
    const response = await request(app.getHttpServer())
      .post(`/relationships/friend-requests/${recipientId}`)
      .set('Authorization', `Bearer ${session}`);

    expect(response.status).toBe(201);
    expect(response.body.status).toBeDefined();
    expect(response.body.last_update).toBeDefined();
    return response;
  };
  const acceptAFriendRequest = async (recipientId: string, session: string) => {
    const response = await request(app.getHttpServer())
      .post(`/relationships/friend-requests/received/${recipientId}/accept`)
      .set('Authorization', `Bearer ${session}`);
    expect(response.status).toBe(201);
    return response;
  };
  const getFriendList = (session:string ) => {
    const get = request(app.getHttpServer())
      .get('/relationships/friends')
      .set('Authorization',`Bearer ${session}`)
    return get

  }
  const getSendFriendRequestList = async (session: string) => {
    const get = request(app.getHttpServer())
      .get('/relationships/send-friend-requests')
      .set('Authorization',`Bearer ${session}`)
    return get
  }
  const getReceivedFriendRequestList = async (session: string) => {
    const get = request(app.getHttpServer())
      .get('/relationships/received-friend-requests')
      .set('Authorization',`Bearer ${session}`)
    return get
  }
    const _sorUserIds = (user_id_1: string, user_id_2: string) => {
    if(user_id_1 === user_id_2 ) throw new Error("can not self select")
    return user_id_1 < user_id_2 ? [user_id_1, user_id_2] : [user_id_2, user_id_1]
  }
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports:[AppModule]
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()

    const login_1 = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ identifier: email_1, password: password_1 })
      .expect(201);

    expect(login_1.body.access_token).toBeDefined();
    expect(login_1.body.id).toBeDefined();
    const login_2 = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ identifier: email_2, password: password_2 })
      .expect(201);
    expect(login_2.body.access_token).toBeDefined();
    expect(login_2.body.id).toBeDefined();

    [user_id_1, user_id_2] = _sorUserIds(login_1.body.id, login_2.body.id)

    if (user_id_1 === login_1.body.id) {
      session_1 = login_1.body.access_token
      session_2 = login_2.body.access_token
    }
    else {
      session_1 = login_2.body.access_token
      session_2 = login_1.body.access_token
    }
  })

  describe('User 1 send to user 2 and user 2 accept',() => {
    // user 1 send to user 2
    it('user 1 should able to send request', async () => {
      const send = await sendFriendRequest(user_id_2,session_1)
    })
    // user 1 check if user 2 in the send requests list
    // need validate against the expected result
    it('send requests list of user 1 must have user 2', async () => {
      const list = await getSendFriendRequestList(session_1)
      const expected_include = [{
        id1: user_id_1,
        id2: user_id_2,
        status: relationship.request_from_1,
        last_update:expect.any(String)
      }]
      expect(200)
      expect(list.body).toBeDefined()
      expect(list.body).toEqual(expect.arrayContaining(expected_include))
    })

    // user2 check if user 1 in the received requests list
    // need validate against the expected result
    it('user 1 should in user2 received list', async () => {
      const list = await getReceivedFriendRequestList(session_2)
      const expected_include = [{
        id1: user_id_1,
        id2: user_id_2,
        status: relationship.request_from_1,
        last_update:expect.any(String)
      }]
      expect(200)
      expect(list.body).toBeDefined()
      expect(list.body).toEqual(expect.arrayContaining(expected_include))
    })

    // user 2 then accept the user 1 request
    it('user 2 should able to accept user 1 request', async () => {
      const accept = await acceptAFriendRequest(user_id_1,session_2)
    })

    //user 1 must have user 2 in friendlist
    // add validate with the expect result
    it('user 2 should in user 1 friend list', async () => {
      const list = await getFriendList(session_1)
      const expected_include = [{
        id1: user_id_1,
        id2: user_id_2,
        status: relationship.friend,
        last_update:expect.any(String)
      }]
      expect(200)
      expect(list.body).toBeDefined()
      expect(list.body).toEqual(expect.arrayContaining(expected_include))
    })

    //user 2 must have user 1 in friendlist
    // add validate with the expect result
    it('user 1 should in user 2 friend list', async () => {
      const list = await getFriendList(session_2)
      const expected_include = [{
        id1: user_id_1,
        id2: user_id_2,
        status: relationship.friend,
        last_update:expect.any(String)
      }]
      expect(200)
      expect(list.body).toBeDefined()
      expect(list.body).toEqual(expect.arrayContaining(expected_include))
    })

    // -MIMO: Keep the unfriend mutation isolated so failures identify the request that changed the relationship.
    it('user 1 should be able to unfriend user 2', async () => {
      await request(app.getHttpServer())
        .delete(`/relationships/friends/${user_id_2}`)
        .set('Authorization', `Bearer ${session_1}`)
        .expect(200, { count: 1 });
    });

    it('user 2 should no longer appear in user 1 friend list', async () => {
      const user_1_friends = await getFriendList(session_1).expect(200);
      expect(user_1_friends.body).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id1: user_id_1, id2: user_id_2 })]),
      );
    });

    it('user 1 should no longer appear in user 2 friend list', async () => {
      const user_2_friends = await getFriendList(session_2).expect(200);
      expect(user_2_friends.body).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id1: user_id_1, id2: user_id_2 })]),
      );
    });
  })

})
}
