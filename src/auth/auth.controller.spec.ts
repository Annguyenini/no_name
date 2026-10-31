import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: {} }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the authenticated user ID for sign-in via token', async () => {
    const request = { user: { id: 'user-123', email: 'person@example.com' } } as any;

    await expect(controller.signInViaToken(request)).resolves.toEqual({ user_id: 'user-123' });
  });
  it('return')
});
// -MIMO: Stub AuthService so the controller unit test does not need auth infrastructure.
