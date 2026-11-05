import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from '../auth.controller.js';
import { AuthService } from '../auth.service.js';

// -MIMO: Replace the incomplete controller spec with focused tests for request handling, service delegation, and controller response shaping.
describe('AuthController', () => {
  let controller: AuthController;
  let auth_service: {
    signUp: ReturnType<typeof vi.fn>;
    signIn: ReturnType<typeof vi.fn>;
    requestNewAccessToken: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    resendEmailConfirmation: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    auth_service = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      requestNewAccessToken: vi.fn(),
      signOut: vi.fn(),
      resendEmailConfirmation: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: auth_service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates signup with the submitted credentials', async () => {
    const credentials = { email: 'person@example.com', password: 'Password1!' };
    const response = { id: 'user-1' };
    auth_service.signUp.mockResolvedValue(response);

    await expect(controller.signUp(credentials)).resolves.toBe(response);
    expect(auth_service.signUp).toHaveBeenCalledWith(credentials);
  });

  it('propagates signup failures from the service', async () => {
    const credentials = { email: 'person@example.com', password: 'Password1!' };
    const error = new UnauthorizedException('Signup failed');
    auth_service.signUp.mockRejectedValue(error);

    await expect(controller.signUp(credentials)).rejects.toBe(error);
  });

  it('delegates sign-in with the submitted credentials', async () => {
    const credentials = { identifier: 'person@example.com', password: 'Password1!' };
    const response = { id: 'user-1', access_token: 'access-1', refresh_token: 'refresh-1' };
    auth_service.signIn.mockResolvedValue(response);

    await expect(controller.signIn(credentials)).resolves.toBe(response);
    expect(auth_service.signIn).toHaveBeenCalledWith(credentials);
  });

  it('propagates sign-in failures from the service', async () => {
    const credentials = { identifier: 'person@example.com', password: 'WrongPassword1!' };
    const error = new UnauthorizedException('Invalid credential');
    auth_service.signIn.mockRejectedValue(error);

    await expect(controller.signIn(credentials)).rejects.toBe(error);
  });

  it('returns the authenticated user ID from the guarded request', async () => {
    const request = { user: { id: 'user-123', email: 'person@example.com' } } as any;

    await expect(controller.signInViaToken(request)).resolves.toEqual({ user_id: 'user-123' });
  });

  it('passes the bearer refresh token to the service', async () => {
    const response = { access_token: 'access-2', refresh_token: 'refresh-2' };
    auth_service.requestNewAccessToken.mockResolvedValue(response);

    await expect(controller.refreshToken('Bearer refresh-1')).resolves.toBe(response);
    expect(auth_service.requestNewAccessToken).toHaveBeenCalledWith('refresh-1');
  });

  it('propagates refresh failures from the service', async () => {
    const error = new UnauthorizedException('Invalid refresh token');
    auth_service.requestNewAccessToken.mockRejectedValue(error);

    await expect(controller.refreshToken('Bearer invalid-token')).rejects.toBe(error);
  });

  it.each([undefined, '', 'refresh-1', 'Basic refresh-1', 'Bearer   '])(
    'rejects a missing or malformed refresh authorization header (%s)',
    async (authorization) => {
      await expect(controller.refreshToken(authorization)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(auth_service.requestNewAccessToken).not.toHaveBeenCalled();
    },
  );

  it('passes the access token from the authorization header to sign-out', async () => {
    const response = { message: 'Signed out successfully' };
    auth_service.signOut.mockResolvedValue(response);
    const request = { headers: { authorization: 'Bearer access-1' } } as Request;

    await expect(controller.signOut(request)).resolves.toBe(response);
    expect(auth_service.signOut).toHaveBeenCalledWith('access-1');
  });

  it('propagates sign-out failures from the service', async () => {
    const error = new UnauthorizedException('Invalid access token');
    auth_service.signOut.mockRejectedValue(error);
    const request = { headers: { authorization: 'Bearer invalid-token' } } as Request;

    await expect(controller.signOut(request)).rejects.toBe(error);
  });

  it('delegates resend confirmation with the submitted email', async () => {
    const email = { email: 'person@example.com' };
    auth_service.resendEmailConfirmation.mockResolvedValue(undefined);

    await expect(controller.resend(email)).resolves.toBeUndefined();
    expect(auth_service.resendEmailConfirmation).toHaveBeenCalledWith(email);
  });

  it('propagates resend confirmation failures from the service', async () => {
    const email = { email: 'person@example.com' };
    const error = new Error('Resend failed');
    auth_service.resendEmailConfirmation.mockRejectedValue(error);

    await expect(controller.resend(email)).rejects.toBe(error);
  });
});
