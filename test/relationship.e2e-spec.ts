import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module.js";
import request from 'supertest';
import { INestApplication } from "@nestjs/common";
import { App } from "supertest/types.js";

// maintain 2 active sessions for 2 mock users, using them to test for feature
describe("Relationship e2e test", () => {
  const email_1 = "testtses111@gmail.com";
  const password_1 = "KKIIk1123@";
  let user_id_1:string
  const email_2 = "testts111@gmail.com";
  const password_2 = "KKIIk1123@";
  let user_id_2:string
  let app: INestApplication<App>;
  let session_1:string
  let session_2:string

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
    session_1 = login_1.body.access_token;
    expect(login_1.body.id).toBeDefined();
    user_id_1 = login_1.body.id


    const login_2 = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ identifier: email_2, password: password_2 })
      .expect(201);

    expect(login_2.body.access_token).toBeDefined();
    session_2= login_2.body.access_token;
    expect(login_2.body.id).toBeDefined();
    user_id_2 = login_2.body.id
  })

  describe('User 1 send to user 2 and user 2 accept',() => {
    // user 1 send to user 2
    it('user 1 should able to send request', async () => {
      const send = await request(app.getHttpServer())
        .post(`/relationship/friend-requests/${user_id_2}`)
        .set("Authorization",session_1)
      expect(200)
      expect(send.body.status).toBeDefined()
      expect(send.body.last_update).toBeDefined()
    })
    // user 1 check if user 2 in the send requests list
    // need validate against the expected result
    it('send requests list of user 1 must have user 2', async () => {
      const list = await request(app.getHttpServer())
        .get(`/relationship/send-friend-requests`)
        .set('Authorization',session_1)
    })

    // user2 check if user 1 in the received requests list
    // need validate against the expected result
    it('user 1 should in user2 received list', async () => {
      const get = await request(app.getHttpServer())
        .get('/relationship/received-friend-requests')
        .set('Authorization',session_2)
    })

    // user 2 then accept the user 1 request
    it('user 2 should able to accept user 1 request', async () => {
      const accept = await request(app.getHttpServer())
        .post (`relationship/friend-requests/received/${user_id_1}/accept`)
        .set('Authorizaion',session_2)
        expect(200)
    })

    //user 1 must have user 2 in friendlist
    // add validate with the expect result
    it('user 2 should in user 1 friend list', async () => {
      const list = await request(app.getHttpServer())
        .get('/relationship/friends')
        .set('Authorizaion',session_1)
    })

    //user 2 must have user 1 in friendlist
    // add validate with the expect result
    it('user 1 should in user 2 friend list', async () => {
      const list = await request(app.getHttpServer())
        .get('/relationship/friends')
        .set('Authorizaion',session_2)
    })
  })
  // senario 2 - user 1 send request -> user2 => user 2 in user 1 send list => user 1 in user 2 received list.
  // user 2 reject the request => user 1 removed from user 2 received list, user 2 removed from user 1 send list
  describe('Senario 2 ', () => {
    // user 1 send to user 2
    it('user 1 should able to send request', async () => {
      const send = await request(app.getHttpServer())
        .post(`/relationship/friend-requests/${user_id_2}`)
        .set("Authorization",session_1)
      expect(200)
      expect(send.body.status).toBeDefined()
      expect(send.body.last_update).toBeDefined()
    })
    // user 1 check if user 2 in the send requests list
    // need validate against the expected result
    it('send requests list of user 1 must have user 2', async () => {
      const list = await request(app.getHttpServer())
        .get(`/relationship/send-friend-requests`)
        .set('Authorization',session_1)
    })
  })
})