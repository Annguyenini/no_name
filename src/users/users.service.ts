import { Injectable } from '@nestjs/common';
import { UserDTO } from './dto/user.dto.js';
import { UserRepositoryService } from './users.repository.service.js';
import { DatabaseException, RepositoryExceptions } from '../core/exceptions/app-exceptions.js';

@Injectable()
export class UsersService {
  constructor(private readonly user_repository: UserRepositoryService) { }
  async createProfile(user: UserDTO) {
    try {
      const created = await this.user_repository.insertNewUser(user)
      return created
    }
    catch (err) {
      throw new RepositoryExceptions("user",err,`Failed to get create profile`,400)
    }
  }

}
