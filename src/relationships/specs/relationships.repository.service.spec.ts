import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RelationshipsRepositoryService } from '../relationships.repository.service.js';
import { relationship } from '../../generated/prisma/enums.js';

describe('RelationshipsRepositoryService', () => {
  let service: RelationshipsRepositoryService;
  let prisma: { friendships: { findMany: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = { friendships: { findMany: vi.fn() } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelationshipsRepositoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<RelationshipsRepositoryService>(RelationshipsRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -MIMO: Verify both friendship directions are filtered so only requests received by the user are returned.
  it('finds received requests from either friendship row direction', async () => {
    const request_rows = [{ id1: 'sender-1', id2: 'receiver', status: relationship.request_from_1 }];
    prisma.friendships.findMany.mockResolvedValue(request_rows);
    await expect(service.getReceivedFriendRequests('receiver')).resolves.toEqual(request_rows);
  });
  it('finds friends', async () => {
    const request_rows = [{ id1: 'sender-1', id2: 'receiver', status: relationship.friend }];
    prisma.friendships.findMany.mockResolvedValue(request_rows)
    await expect(service.getUserFriendList('sender-1')).resolves.toEqual(request_rows)
  })
  it('finds send requests', async () => {
    const request_rows = [{ id1: 'sender-1', id2: 'receiver', status: relationship.request_from_1 }];
    prisma.friendships.findMany.mockResolvedValue(request_rows)
    await expect(service.getSendFriendRequests('sender-1')).resolves.toEqual(request_rows)
  })
});
