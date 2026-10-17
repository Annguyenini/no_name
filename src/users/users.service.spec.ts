import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { UserRepositoryService } from './users.repository.service.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepositoryService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
// -MIMO: Provide the user's repository dependency so this unit test can instantiate the service in isolation.
