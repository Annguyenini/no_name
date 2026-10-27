import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentsRepositoryService } from '../contents/contents.repository.service.js';
import { UserRepositoryService } from './users.repository.service.js';
import { UsersService } from './users.service.js';

// -MIMO: Verify user profile and avatar service behavior using mocked repositories only.
describe('UsersService', () => {
  let service: UsersService;
  let user_repository: {
    getUserById: ReturnType<typeof vi.fn>;
    insertNewUser: ReturnType<typeof vi.fn>;
    getUserAvatarAccessUrl: ReturnType<typeof vi.fn>;
    updateDisplayName: ReturnType<typeof vi.fn>;
    requestAvatarUploadURL: ReturnType<typeof vi.fn>;
    checkAvatarUploadURL: ReturnType<typeof vi.fn>;
    updateUserAvatarProperties: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    user_repository = {
      getUserById: vi.fn(),
      insertNewUser: vi.fn(),
      getUserAvatarAccessUrl: vi.fn(),
      updateDisplayName: vi.fn(),
      requestAvatarUploadURL: vi.fn(),
      checkAvatarUploadURL: vi.fn(),
      updateUserAvatarProperties: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepositoryService, useValue: user_repository },
        { provide: ContentsRepositoryService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("returns the current user's profile", async () => {
    const profile = { id: 'user-1', username: 'tester', display_name: 'Test User' };
    user_repository.getUserById.mockResolvedValue(profile);

    await expect(service.getMyProfile('user-1')).resolves.toBe(profile);
  });

  it('throws when the requested profile does not exist', async () => {
    user_repository.getUserById.mockResolvedValue(null);

    await expect(service.getMyProfile('missing-user')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects creating a profile when one already exists', async () => {
    user_repository.getUserById.mockResolvedValue({ id: 'user-1' });

    await expect(service.createProfile({ id: 'user-1' } as never)).rejects.toBeInstanceOf(ConflictException);
    expect(user_repository.insertNewUser).not.toHaveBeenCalled();
  });

  it('creates a profile when no profile exists', async () => {
    const user = { id: 'user-1', username: 'tester', display_name: 'Test User' };
    const created_profile = { ...user, status: 'active' };
    user_repository.getUserById.mockResolvedValue(null);
    user_repository.insertNewUser.mockResolvedValue(created_profile);

    await expect(service.createProfile(user as never)).resolves.toBe(created_profile);
    expect(user_repository.insertNewUser).toHaveBeenCalledWith(user);
  });

  it('returns an access URL for the requested user avatar', async () => {
    user_repository.getUserAvatarAccessUrl.mockResolvedValue('https://s3.example/avatar');

    await expect(service.getUserAvatar('user-1')).resolves.toEqual({ url: 'https://s3.example/avatar' });
  });

  it('saves avatar properties only after the upload is verified', async () => {
    const avatar_properties = { content_type: 'image/jpeg', size: 1024 };
    const updated_profile = { id: 'user-1', avatar_properties };
    user_repository.checkAvatarUploadURL.mockResolvedValue({ ContentLength: 1024 });
    user_repository.updateUserAvatarProperties.mockResolvedValue(updated_profile);

    await expect(service.validateUpdateAvatarProperties('user-1', avatar_properties)).resolves.toBe(updated_profile);
    expect(user_repository.checkAvatarUploadURL).toHaveBeenCalledWith('user-1');
    expect(user_repository.updateUserAvatarProperties).toHaveBeenCalledWith('user-1', avatar_properties);
  });

  it('rejects avatar properties when no uploaded object is verified', async () => {
    user_repository.checkAvatarUploadURL.mockResolvedValue(null);

    await expect(service.validateUpdateAvatarProperties('user-1', {})).rejects.toBeInstanceOf(BadRequestException);
    expect(user_repository.updateUserAvatarProperties).not.toHaveBeenCalled();
  });
});
