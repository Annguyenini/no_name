import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminRepositoryService {
  constructor(private readonly prisma: PrismaService) {}

  // -MIMO: Read a user's assigned role so admin authorization uses persisted permissions.
  async isAdmin(user_id: string): Promise<boolean> {
    const permission = await this.prisma.permission.findUnique({
      where: { id: user_id },
      select: { role: true },
    });
    return permission?.role === 'admin';
  }

  // -MIMO: Delete an application profile and return its identifier for the admin response.
  async deleteUserById(user_id: string): Promise<string | null> {
    const deleted = await this.prisma.users.deleteMany({ where: { id: user_id } });
    return deleted.count > 0 ? user_id : null;
  }
}
