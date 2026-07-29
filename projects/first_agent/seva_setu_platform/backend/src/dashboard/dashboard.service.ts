import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMySavedSchemes(userId: string) {
    return this.prisma.savedScheme.findMany({
      where: { userId },
      include: {
        scheme: true,
        actionPlan: {
          include: {
            checklist: true,
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });
  }

  async saveScheme(userId: string, schemeId: string) {
    // Check if scheme exists
    const scheme = await this.prisma.scheme.findUnique({ where: { id: schemeId } });
    if (!scheme) {
      throw new NotFoundException('Scheme not found');
    }

    // Upsert to prevent duplicates
    const savedScheme = await this.prisma.savedScheme.create({
      data: {
        userId,
        schemeId,
        status: ApplicationStatus.TODO,
        actionPlan: {
          create: {
            steps: ['Review Eligibility', 'Gather Documents', 'Apply Online'],
            checklist: {
              create: scheme.documentsRequired.map(doc => ({
                name: doc,
                isCompleted: false,
              })),
            },
          },
        },
      },
      include: {
        scheme: true,
        actionPlan: {
          include: {
            checklist: true,
          },
        },
      },
    });

    return savedScheme;
  }

  async updateApplicationStatus(savedSchemeId: string, status: ApplicationStatus) {
    return this.prisma.savedScheme.update({
      where: { id: savedSchemeId },
      data: { status },
      include: {
        scheme: true,
        actionPlan: {
          include: { checklist: true },
        },
      },
    });
  }

  async toggleChecklistItem(actionPlanId: string, itemName: string, isCompleted: boolean) {
    // Find the item
    const item = await this.prisma.checklistItem.findFirst({
      where: { actionPlanId, name: itemName },
    });

    if (!item) {
      throw new NotFoundException('Checklist item not found');
    }

    await this.prisma.checklistItem.update({
      where: { id: item.id },
      data: { isCompleted },
    });

    return this.prisma.actionPlan.findUnique({
      where: { id: actionPlanId },
      include: { checklist: true },
    });
  }

  async getCitizenProfileSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    
    const activeApplications = await this.prisma.savedScheme.count({
      where: { userId, status: { not: ApplicationStatus.APPROVED } }
    });

    return { user, activeApplications };
  }

  async purgeCitizenPersonalData(userId: string) {
    try {
      await this.prisma.user.delete({ where: { id: userId } });
      return true;
    } catch (e) {
      return false;
    }
  }
}
