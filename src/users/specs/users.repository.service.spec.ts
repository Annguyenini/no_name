import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '../../generated/prisma/internal/prismaNamespace.js';
import { ContentsRepositoryService } from '../../contents/contents.repository.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserRepositoryService } from '../users.repository.service.js';

// -MIMO: Cover user repository Prisma mapping, updates, and missing-row behavior with isolated mocks.
describe('UserRepositoryService', () => {
  let service: UserRepositoryService;
  let prisma_service: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prisma_service = {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryService,
        { provide: PrismaService, useValue: { users: prisma_service } },
        { provide: ContentsRepositoryService, useValue: {} },
      ],
    }).compile();

    service = module.get<UserRepositoryService>(UserRepositoryService);
  });

  it('returns a mapped user by username', async () => {
    prisma_service.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'tester',
      display_name: 'Test User',
      status: 'active',
      avatar_properties: null,
    });

    await expect(service.getUserByUsername('tester')).resolves.toMatchObject({
      id: 'user-1',
      username: 'tester',
      display_name: 'Test User',
      status: 'active',
      avatar_properties: null,
    });
    expect(prisma_service.findUnique).toHaveBeenCalledWith({ where: { username: 'tester' } });
  });

  it('returns null when a username is not found', async () => {
    prisma_service.findUnique.mockResolvedValue(null);

    await expect(service.getUserByUsername('missing')).resolves.toBeNull();
  });

  it('returns a mapped user by ID', async () => {
    prisma_service.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'tester',
      display_name: 'Test User',
      status: 'active',
      avatar_properties: null,
    });

    await expect(service.getUserById('user-1')).resolves.toMatchObject({
      id: 'user-1',
      username: 'tester',
      display_name: 'Test User',
      status: 'active',
      avatar_properties: null,
    });
    expect(prisma_service.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
  });

  it('returns null when an ID is not found', async () => {
    prisma_service.findUnique.mockResolvedValue(null);

    await expect(service.getUserById('missing')).resolves.toBeNull();
  });

  it('updates and returns the display name', async () => {
    prisma_service.update.mockResolvedValue({
      id: 'user-1',
      username: 'tester',
      display_name: 'Updated Name',
      status: 'active',
      avatar_properties: null,
    });

    await expect(service.updateDisplayName('user-1', 'Updated Name')).resolves.toMatchObject({
      id: 'user-1',
      display_name: 'Updated Name',
    });
    expect(prisma_service.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { display_name: 'Updated Name' },
    });
  });

  it('returns null when the profile being updated does not exist', async () => {
    const missing_profile_error = new PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: 'unit-test',
    });
    prisma_service.update.mockRejectedValue(missing_profile_error);

    await expect(service.updateDisplayName('missing', 'Updated Name')).resolves.toBeNull();
  });

  it('propagates unexpected display-name update errors', async () => {
    const database_error = new Error('Database unavailable');
    prisma_service.update.mockRejectedValue(database_error);

    await expect(service.updateDisplayName('user-1', 'Updated Name')).rejects.toBe(database_error);
  });
});
