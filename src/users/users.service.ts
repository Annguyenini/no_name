import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { UserDTO } from './dto/user.dto.js';
import { UserRepositoryService } from './users.repository.service.js';
import { RepositoryExceptions } from '../core/exceptions/app-exceptions.js';

@Injectable()
export class UsersService {
  constructor(private readonly user_repository: UserRepositoryService) { }

  async getMyProfile(id: string) {
    const profile = await this.user_repository.getUserById(id);
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async getPublicProfile(id: string) {
    const profile = await this.user_repository.getUserById(id);
    if (!profile) throw new NotFoundException('Profile not found');
    return {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
    };
  }

  async updateDisplayName(id: string, displayName: string) {
    const profile = await this.user_repository.updateDisplayName(id, displayName);
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async createProfile(user: UserDTO) {
    try {
      const existingProfile = await this.user_repository.getUserById(user.id)
      if (existingProfile) {
        throw new ConflictException('Profile already exists for this user')
      }

      const created = await this.user_repository.insertNewUser(user)
      return created
    }
    catch (err) {
      if (err instanceof HttpException) throw err
      throw new RepositoryExceptions("user",err,`Failed to get create profile`,400)
    }
  }

}
