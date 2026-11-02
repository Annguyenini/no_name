import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service.js';
import { relationship } from '../../generated/prisma/enums.js';
import { PrismaClientKnownRequestError } from '../../generated/prisma/internal/prismaNamespace.js';
import { RelationshipsRepositoryService } from '../relationships.repository.service.js';

describe('RelationshipsRepositoryService', () => {
  let service: RelationshipsRepositoryService;
  let prisma: {
    friendships: {
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      friendships: {
        findMany: vi.fn(),
        create: vi.fn(),
        updateMany: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [RelationshipsRepositoryService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<RelationshipsRepositoryService>(RelationshipsRepositoryService);
  });

  it('queries one user using the status for each canonical pair direction', async () => {
    const request_rows = [{ id1: 'a', id2: 'b', status: relationship.request_from_1 }];
    prisma.friendships.findMany.mockResolvedValue(request_rows);

    await expect(service.getUserRelationships({
      user_id: 'a',
      when_user_is_id1: relationship.request_from_1,
      when_user_is_id2: relationship.request_from_2,
    })).resolves.toEqual(request_rows);

    expect(prisma.friendships.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { AND: [{ id1: 'a' }, { status: relationship.request_from_1 }] },
          { AND: [{ id2: 'a' }, { status: relationship.request_from_2 }] },
        ],
      },
      orderBy: { last_update: 'desc' },
    });
  });

  it('maps a Prisma foreign-key error to target user not found', async () => {
    const prisma_error = Object.assign(new Error('foreign key failed'), { code: 'P2003' });
    Object.setPrototypeOf(prisma_error, PrismaClientKnownRequestError.prototype);
    prisma.friendships.create.mockRejectedValue(prisma_error);

    await expect(service.addRelationship({
      user_1: 'a', user_2: 'b', status: relationship.request_from_1,
    })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('preserves the client error when no expected status matches during update', async () => {
    prisma.friendships.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.updateRelationship({
      user_1: 'a',
      user_2: 'b',
      status: relationship.request_from_2,
      new_status: relationship.friend,
    })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes only a row in the expected status and returns the count', async () => {
    prisma.friendships.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.deleteRelationship({
      user_1: 'a', user_2: 'b', status: relationship.friend,
    })).resolves.toEqual({ count: 1 });
    expect(prisma.friendships.deleteMany).toHaveBeenCalledWith({
      where: { id1: 'a', id2: 'b', status: relationship.friend },
    });
  });
});
