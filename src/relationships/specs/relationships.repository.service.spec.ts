import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service.js';
import { OneToManyRelationship, OneToOneRelationship, RelationshipsRepositoryService } from '../relationships.repository.service.js';
import { relationship } from '../../generated/prisma/enums.js';

describe('RelationshipsRepositoryService', () => {
  let service: RelationshipsRepositoryService;
  let prisma: { friendships: { findMany: ReturnType<typeof vi.fn>,upsert: ReturnType<typeof vi.fn>,delete: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    prisma = { friendships: { findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() } };
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelationshipsRepositoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<RelationshipsRepositoryService>(RelationshipsRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // -MIMO: Verify both friendship directions are filtered so only requests received by the user are returned.
  it('return all user relationships based in status', async () => {
    const request_rows = [{ id1: 'sender-1', id2: 'receiver', status: relationship.request_from_1,last_update:new Date() },{ id1: 'sender-1', id2: 'receiver2', status: relationship.request_from_1,last_update:new Date() }];
    prisma.friendships.findMany.mockResolvedValue(request_rows);
    // -MIMO: Add the required timestamp to the relationship fixture to match the repository contract.
    const rel: OneToManyRelationship = {
      user_1: 'receiver',
      user_2: 'receiver',
      user_1_status: relationship.request_from_1,
      user_2_status: relationship.request_from_2,
      last_update: new Date(),
    };
    await expect(service.getUserRelationships(rel)).resolves.toEqual(request_rows);
  });

  it('return the relationship object after add', async () => {
    const request = { id1: 'sender-1', id2: 'receiver', status: relationship.request_from_1, last_update: new Date() }
    prisma.friendships.upsert.mockResolvedValue(request)
    const rel: OneToOneRelationship = {
      user_1: 'receiver',
      user_2: 'sender-1',
      status: 'request_from_1',
      last_update:new Date()
    }
    await expect(service.addOrUpdateRelationship(rel)).resolves.toEqual(request)
  })

  it('return the relationship object after delete', async () => {
    const request = { id1: 'sender-1', id2: 'receiver', status: relationship.request_from_1, last_update: new Date() }
    prisma.friendships.delete.mockResolvedValue(request)
    const rel: OneToOneRelationship = {
      user_1: 'receiver',
      user_2: 'sender-1',
      status: 'request_from_1',
      last_update:new Date()
    }
    await expect(service.deleteRelationship(rel)).resolves.toEqual(request)
  })
});
