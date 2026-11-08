import { UnauthorizedException } from '@nestjs/common';
import { UsersController } from '../users.controller.js';
import { UsersService } from '../users.service.js';
import type { AuthenticatedRequest } from '../../core/global-types/authenticated-user.js';

// -MIMO: Add controller unit coverage for authenticated identity checks and delegation to UsersService.
describe('UsersController', () => {
  let controller: UsersController;
  let users_service: {
    getMyProfile: ReturnType<typeof vi.fn>;
    getUserAvatar: ReturnType<typeof vi.fn>;
    getPublicProfile: ReturnType<typeof vi.fn>;
    updateDisplayName: ReturnType<typeof vi.fn>;
    createProfile: ReturnType<typeof vi.fn>;
    requestAvatarUploadurl: ReturnType<typeof vi.fn>;
    validateUpdateAvatarProperties: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    users_service = {
      getMyProfile: vi.fn(),
      getUserAvatar: vi.fn(),
      getPublicProfile: vi.fn(),
      updateDisplayName: vi.fn(),
      createProfile: vi.fn(),
      requestAvatarUploadurl: vi.fn(),
      validateUpdateAvatarProperties: vi.fn(),
    };
    controller = new UsersController(users_service as unknown as UsersService);
  });

  describe('getMyProfile', () => {
    it('gets the profile for the authenticated user', async () => {
      const request = { user: { id: 'user-1' } } as AuthenticatedRequest;
      const profile = { id: 'user-1', username: 'person1' };
      users_service.getMyProfile.mockResolvedValue(profile);

      await expect(controller.getMyProfile(request)).resolves.toBe(profile);
      expect(users_service.getMyProfile).toHaveBeenCalledWith('user-1');
    });

    it('rejects a profile request without an authenticated user ID', async () => {
      await expect(
        controller.getMyProfile({ user: undefined } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(users_service.getMyProfile).not.toHaveBeenCalled();
    });
  });

  describe('getMyAvatar', () => {
    it('gets the authenticated user avatar', async () => {
      const request = { user: { id: 'user-1' } } as AuthenticatedRequest;
      const avatar = { url: 'https://example.test/avatar' };
      users_service.getUserAvatar.mockResolvedValue(avatar);

      await expect(controller.getMyAvatar(request)).resolves.toBe(avatar);
      expect(users_service.getUserAvatar).toHaveBeenCalledWith('user-1');
    });

    it('rejects an avatar request without an authenticated user ID', async () => {
      await expect(
        controller.getMyAvatar({ user: undefined } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(users_service.getUserAvatar).not.toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('gets a public profile by the supplied user ID', async () => {
      const profile = {
        id: 'target-1',
        username: 'person1',
        display_name: 'Person',
      };
      users_service.getPublicProfile.mockResolvedValue(profile);

      await expect(controller.getUserProfile('target-1')).resolves.toBe(
        profile,
      );
      expect(users_service.getPublicProfile).toHaveBeenCalledWith('target-1');
    });
  });

  describe('getUserAvatar', () => {
    it('gets an avatar by the supplied user ID', async () => {
      const avatar = { url: 'https://example.test/avatar' };
      users_service.getUserAvatar.mockResolvedValue(avatar);

      await expect(controller.getUserAvatar('target-1')).resolves.toBe(avatar);
      expect(users_service.getUserAvatar).toHaveBeenCalledWith('target-1');
    });
  });

  describe('updateDisplayName', () => {
    it('updates the authenticated user display name', async () => {
      const request = { user: { id: 'user-1' } } as AuthenticatedRequest;
      const updated = { id: 'user-1', display_name: 'New Name' };
      users_service.updateDisplayName.mockResolvedValue(updated);

      await expect(
        controller.updateDisplayName(request, { display_name: 'New Name' }),
      ).resolves.toBe(updated);
      expect(users_service.updateDisplayName).toHaveBeenCalledWith(
        'user-1',
        'New Name',
      );
    });

    it('rejects a display name update without an authenticated user ID', async () => {
      await expect(
        controller.updateDisplayName({ user: undefined } as never, {
          display_name: 'New Name',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(users_service.updateDisplayName).not.toHaveBeenCalled();
    });
  });

  describe('createProfile', () => {
    it('creates a profile using the authenticated ID instead of a body ID', async () => {
      const request = { user: { id: 'user-1' } } as AuthenticatedRequest;
      const profile = { username: 'person1', display_name: 'Person' };
      const created = { id: 'user-1', ...profile };
      users_service.createProfile.mockResolvedValue(created);

      await expect(controller.createProfile(request, profile)).resolves.toBe(
        created,
      );
      expect(users_service.createProfile).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-1', ...profile }),
      );
    });

    it('rejects profile creation without an authenticated user ID', async () => {
      await expect(
        controller.createProfile({ user: undefined } as never, {
          username: 'person1',
          display_name: 'Person',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(users_service.createProfile).not.toHaveBeenCalled();
    });
  });

  describe('requestUpdateAvatar', () => {
    it('requests an avatar upload URL for the authenticated user', async () => {
      const request = { user: { id: 'user-1' } } as AuthenticatedRequest;
      const upload = { url: 'https://example.test/upload' };
      users_service.requestAvatarUploadurl.mockResolvedValue(upload);

      await expect(controller.requestUpdateAvatar(request)).resolves.toBe(
        upload,
      );
      expect(users_service.requestAvatarUploadurl).toHaveBeenCalledWith(
        'user-1',
      );
    });

    it('rejects an avatar upload URL request without an authenticated user ID', async () => {
      await expect(
        controller.requestUpdateAvatar({ user: undefined } as never),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(users_service.requestAvatarUploadurl).not.toHaveBeenCalled();
    });
  });

  describe('requestValidateUploadedAvatar', () => {
    it('validates uploaded avatar properties for the authenticated user', async () => {
      const request = { user: { id: 'user-1' } } as AuthenticatedRequest;
      const properties = { width: 100, height: 100 };
      const updated = { id: 'user-1', avatar_properties: properties };
      users_service.validateUpdateAvatarProperties.mockResolvedValue(updated);

      await expect(
        controller.requestValidateUploadedAvatar(request, properties),
      ).resolves.toBe(updated);
      expect(users_service.validateUpdateAvatarProperties).toHaveBeenCalledWith(
        'user-1',
        properties,
      );
    });

    it('rejects avatar validation without an authenticated user ID', async () => {
      await expect(
        controller.requestValidateUploadedAvatar(
          { user: undefined } as never,
          {},
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(
        users_service.validateUpdateAvatarProperties,
      ).not.toHaveBeenCalled();
    });
  });
});
