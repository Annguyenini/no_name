
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { SupabaseService } from '../src/supabase-service/supabase.service.js';
import { ConfigService } from '../src/config/config.service.js';
import { UserRepositoryService } from '../src/users/users.repository.service.js';
import { SupabaseAdminService } from '../src/supabase-service/supabase.admin.service.js';
import { userSetup } from './auth.js';
import { relationship } from '../src/generated/prisma/enums.js';
import { senario1RelationshipTest } from './e2e-relationship/1-relationship.js';
import { senario2RelationshipTest } from './e2e-relationship/2-relationship.js';
import { senario3RelationshipTest } from './e2e-relationship/3-relationship.js';
const config = new ConfigService()
const supabase = new SupabaseService(config)
const supabase_admin_service = new SupabaseAdminService(supabase)

describe('AppController (e2e)', () => {
  const email_1 = "testtses111@gmail.com";
  const email_2 = "testts2211@gmail.com";
  const password_1 = "Oigioioi1123@";
  const password_2 = "Oigioioi1123@";

  // -MIMO: Keep the integration flow repeatable with the provisioned test account and current API routes.
  beforeAll(async () => {
    // delete testing users
    try {
      await supabase_admin_service.deleteUserByEmail(email_1)
      await supabase_admin_service.deleteUserByEmail(email_2)
    }
    catch (err) {
      console.error(err)
    }
  }, 15000);
    userSetup(email_1, password_1)
    userSetup(email_2,password_2)

    // -MIMO: Register the user 1 sends/user 2 rejects flow with the existing provisioned test accounts.
    senario2RelationshipTest({
      email_1,
      email_2,
      password_1,
      password_2
  })
    // -MIMO: Register the sender cancellation flow after rejection and before acceptance reuses the test pair.
    senario3RelationshipTest({
      email_1,
      email_2,
      password_1,
      password_2
  })
    senario1RelationshipTest({
      email_1,
      email_2,
      password_1,
      password_2
  })
})
