import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultationStatus } from '@prisma/client';

@Injectable()
export class ConsultationService {
  constructor(private prisma: PrismaService) {}

  async getConsultants(specialty?: string, state?: string) {
    const whereClause: any = {
      isVerified: true,
    };
    if (specialty) {
      whereClause.specialties = { has: specialty };
    }
    // Simple mock filter for state by joining User profile
    return this.prisma.consultant.findMany({
      where: whereClause,
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
  }

  async getConsultationDetails(id: string) {
    return this.prisma.consultation.findUnique({
      where: { id },
      include: {
        citizen: { include: { profile: true } },
        consultant: { include: { user: true } },
      },
    });
  }

  async bookConsultation(citizenId: string, consultantId: string, scheduledAt: string) {
    const consultant = await this.prisma.consultant.findUnique({ where: { id: consultantId } });
    if (!consultant) {
      throw new NotFoundException('Consultant not found');
    }

    return this.prisma.consultation.create({
      data: {
        citizenId,
        consultantId,
        scheduledAt: new Date(scheduledAt),
        status: ConsultationStatus.PENDING,
      },
      include: {
        citizen: { include: { profile: true } },
        consultant: { include: { user: true } },
      },
    });
  }

  async cancelConsultation(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({ where: { id: consultationId } });
    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: ConsultationStatus.CANCELLED },
      include: {
        citizen: { include: { profile: true } },
        consultant: { include: { user: true } },
      },
    });
  }
}
