import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileInput } from './user.types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException({
        error: {
          code: 'NOT_FOUND',
          message: 'User profile not found.',
        }
      });
    }

    return user;
  }

  async updateProfile(userId: string, input: ProfileInput) {
    await this.prisma.profile.upsert({
      where: { userId },
      update: { ...input },
      create: {
        userId,
        ...input,
      },
    });

    // Return the completely hydrated user
    return this.getUserById(userId);
  }
}
