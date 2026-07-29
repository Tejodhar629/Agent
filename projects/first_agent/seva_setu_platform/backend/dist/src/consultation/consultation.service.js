"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ConsultationService = class ConsultationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConsultants(specialty, state) {
        const whereClause = {
            isVerified: true,
        };
        if (specialty) {
            whereClause.specialties = { has: specialty };
        }
        return this.prisma.consultant.findMany({
            where: whereClause,
            include: {
                user: {
                    include: { profile: true },
                },
            },
        });
    }
    async getConsultationDetails(id) {
        return this.prisma.consultation.findUnique({
            where: { id },
            include: {
                citizen: { include: { profile: true } },
                consultant: { include: { user: true } },
            },
        });
    }
    async bookConsultation(citizenId, consultantId, scheduledAt) {
        const consultant = await this.prisma.consultant.findUnique({ where: { id: consultantId } });
        if (!consultant) {
            throw new common_1.NotFoundException('Consultant not found');
        }
        return this.prisma.consultation.create({
            data: {
                citizenId,
                consultantId,
                scheduledAt: new Date(scheduledAt),
                status: client_1.ConsultationStatus.PENDING,
            },
            include: {
                citizen: { include: { profile: true } },
                consultant: { include: { user: true } },
            },
        });
    }
    async cancelConsultation(consultationId, userId) {
        const consultation = await this.prisma.consultation.findUnique({ where: { id: consultationId } });
        if (!consultation) {
            throw new common_1.NotFoundException('Consultation not found');
        }
        return this.prisma.consultation.update({
            where: { id: consultationId },
            data: { status: client_1.ConsultationStatus.CANCELLED },
            include: {
                citizen: { include: { profile: true } },
                consultant: { include: { user: true } },
            },
        });
    }
};
exports.ConsultationService = ConsultationService;
exports.ConsultationService = ConsultationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConsultationService);
//# sourceMappingURL=consultation.service.js.map