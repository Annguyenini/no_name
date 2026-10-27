import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepositoryService } from './auth-repository.service.js';
import { AuthService } from './auth.service.js';

// -MIMO: Verify auth token handling and invalid-credential failures with a mocked repository.
describe('AuthService', () => {
  let service: AuthService;
  let auth_repository: {
    signIn: ReturnType<typeof vi.fn>;
    requestNewAccessToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    auth_repository = {
      signIn: vi.fn(),
      requestNewAccessToken: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: AuthRepositoryService, useValue: auth_repository }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns access and refresh tokens after sign-in', async () => {
    auth_repository.signIn.mockResolvedValue({
      data: {
        user: { id: 'user-1' },
        session: { access_token: 'access-1', refresh_token: 'refresh-1' },
      },
    });

    await expect(service.signIn({ identifier: 'person@example.com', password: 'Password1!' })).resolves.toEqual({
      id: 'user-1',
      access_token: 'access-1',
      refresh_token: 'refresh-1',
    });
  });

  it('propagates invalid sign-in credentials', async () => {
    auth_repository.signIn.mockRejectedValue(new UnauthorizedException('Invalid credential'));

    await expect(service.signIn({ identifier: 'person@example.com', password: 'wrong' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns rotated tokens after a successful refresh', async () => {
    auth_repository.requestNewAccessToken.mockResolvedValue({
      data: {
        user: { id: 'user-1' },
        session: { access_token: 'access-2', refresh_token: 'refresh-2' },
      },
    });

    await expect(service.requestNewAccessToken('refresh-1')).resolves.toEqual({
      access_token: 'access-2',
      refresh_token: 'refresh-2',
    });
  });

  it('rejects a refresh response without a valid session', async () => {
    auth_repository.requestNewAccessToken.mockResolvedValue({
      data: { user: { id: 'user-1' }, session: null },
    });

    await expect(service.requestNewAccessToken('invalid-refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
