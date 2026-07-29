import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SchemeInput } from './admin.types';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPlatformMetrics(userId: string, role: string) {
    if (role !== Role.ADMIN) {
      throw new UnauthorizedException('Only admins can view platform metrics');
    }

    const totalUsers = await this.prisma.user.count();
    const totalApplications = await this.prisma.savedScheme.count();
    const topSchemes = await this.prisma.scheme.findMany({
      take: 5,
      orderBy: {
        savedSchemes: {
          _count: 'desc'
        }
      }
    });

    return {
      dailyActiveUsers: Math.floor(totalUsers * 0.1), // Mock DAU calculation
      totalApplicationsTracked: totalApplications,
      topSearchedSchemes: topSchemes,
    };
  }

  async updateScheme(schemeId: string, input: SchemeInput, role: string) {
    if (role !== Role.ADMIN && role !== Role.EDITOR) {
      throw new UnauthorizedException('Not authorized to update schemes');
    }

    const scheme = await this.prisma.scheme.findUnique({ where: { id: schemeId } });
    if (!scheme) {
      throw new NotFoundException('Scheme not found');
    }

    return this.prisma.scheme.update({
      where: { id: schemeId },
      data: {
        title: input.title !== undefined ? input.title : undefined,
        description: input.description !== undefined ? input.description : undefined,
        ministry: input.ministry !== undefined ? input.ministry : undefined,
        officialLink: input.officialLink !== undefined ? input.officialLink : undefined,
        eligibilityCriteria: input.eligibilityCriteria !== undefined ? input.eligibilityCriteria : undefined,
        benefits: input.benefits !== undefined ? input.benefits : undefined,
        documentsRequired: input.documentsRequired !== undefined ? input.documentsRequired : undefined,
      },
    });
  }
}
