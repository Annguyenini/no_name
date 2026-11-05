import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseException, RepositoryExceptions } from '../../core/exceptions/app-exceptions.js';
import { SupabaseService } from '../../supabase-service/supabase.service.js';
import { AuthRepositoryService } from '../auth-repository.service.js';

// -MIMO: Organize repository unit tests by Auth operation and provide the Supabase client shape expected by the repository.
describe('AuthRepositoryService', () => {
  let repository: AuthRepositoryService;
  let supabase: {
    signUp: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    resend: ReturnType<typeof vi.fn>;
    refreshSession: ReturnType<typeof vi.fn>;
    adminSignOut: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    supabase = {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resend: vi.fn(),
      refreshSession: vi.fn(),
      adminSignOut: vi.fn(),
    };

    const supabase_client = {
      auth: {
        signUp: supabase.signUp,
        signInWithPassword: supabase.signInWithPassword,
        resend: supabase.resend,
        refreshSession: supabase.refreshSession,
        admin: { signOut: supabase.adminSignOut },
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepositoryService,
        { provide: SupabaseService, useValue: { getClient: () => supabase_client as unknown as SupabaseClient } },
      ],
    }).compile();

    repository = module.get<AuthRepositoryService>(AuthRepositoryService);
  });

  describe('signUp', () => {
    it('returns the Supabase result when signup succeeds', async () => {
      const result = {
        data: { user: { id: 'user-1' }, session: { access_token: 'access-1', refresh_token: 'refresh-1' } },
        error: null,
      };
      supabase.signUp.mockResolvedValue(result);

      await expect(repository.signUp({ email: 'person@example.com', password: 'Password1!' })).resolves.toEqual(result);
    });

    it('throws BadRequestException when Supabase rejects signup', async () => {
      supabase.signUp.mockResolvedValue({ data: null, error: { message: 'Invalid email' } });

      await expect(repository.signUp({ email: 'person@example.com', password: 'Password1!' })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequestException when Supabase returns no user', async () => {
      supabase.signUp.mockResolvedValue({ data: { user: null, session: null }, error: null });

      await expect(repository.signUp({ email: 'person@example.com', password: 'Password1!' })).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('signIn', () => {
    it('returns the Supabase result when sign-in succeeds', async () => {
      const result = {
        data: { user: { id: 'user-1' }, session: { access_token: 'access-1', refresh_token: 'refresh-1' } },
        error: null,
      };
      supabase.signInWithPassword.mockResolvedValue(result);

      await expect(repository.signIn({ identifier: 'person@example.com', password: 'Password1!' })).resolves.toEqual(result);
    });

    it('throws UnauthorizedException when credentials are rejected', async () => {
      supabase.signInWithPassword.mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } });

      await expect(repository.signIn({ identifier: 'person@example.com', password: 'Password1!' })).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('resendSignupEmailConfirmation', () => {
    it('resolves when Supabase reports no resend error', async () => {
      supabase.resend.mockResolvedValue({ data: { user: null }, error: null });

      await expect(repository.resendSignupEmailConfirmation({ email: 'person@example.com' })).resolves.toBeUndefined();
    });

    it('throws SupabaseException when Supabase returns an Auth error', async () => {
      supabase.resend.mockResolvedValue({ data: null, error: { message: 'Resend failed', status: 500 } });

      await expect(repository.resendSignupEmailConfirmation({ email: 'person@example.com' })).rejects.toBeInstanceOf(SupabaseException);
    });

    it('wraps a rejected Supabase request in RepositoryExceptions', async () => {
      supabase.resend.mockRejectedValue(new Error('Network failure'));

      await expect(repository.resendSignupEmailConfirmation({ email: 'person@example.com' })).rejects.toBeInstanceOf(RepositoryExceptions);
    });
  });

  describe('requestNewAccessToken', () => {
    it('returns the refreshed user and session', async () => {
      const result = {
        data: { user: { id: 'user-1' }, session: { access_token: 'access-2', refresh_token: 'refresh-2' } },
        error: null,
      };
      supabase.refreshSession.mockResolvedValue(result);

      await expect(repository.requestNewAccessToken('refresh-1')).resolves.toEqual(result);
    });

    it('throws UnauthorizedException when the refresh token is rejected', async () => {
      supabase.refreshSession.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Invalid token' } });

      await expect(repository.requestNewAccessToken('bad-token')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('wraps an unexpected refresh request failure in RepositoryExceptions', async () => {
      supabase.refreshSession.mockRejectedValue(new Error('Network failure'));

      await expect(repository.requestNewAccessToken('refresh-1')).rejects.toBeInstanceOf(RepositoryExceptions);
    });
  });

  describe('signOut', () => {
    it('resolves when Supabase signs out the session', async () => {
      supabase.adminSignOut.mockResolvedValue({ error: null });

      await expect(repository.signOut('access-1')).resolves.toBeUndefined();
    });

    it('throws SupabaseException with 401 when Supabase rejects the token', async () => {
      supabase.adminSignOut.mockResolvedValue({ error: { message: 'Invalid token', status: 401 } });

      await expect(repository.signOut('bad-token')).rejects.toBeInstanceOf(SupabaseException);
    });

    it('wraps an unexpected sign-out request failure in RepositoryExceptions', async () => {
      supabase.adminSignOut.mockRejectedValue(new Error('Network failure'));

      await expect(repository.signOut('access-1')).rejects.toBeInstanceOf(RepositoryExceptions);
    });
  });
});
