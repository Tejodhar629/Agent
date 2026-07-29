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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMySavedSchemes(userId) {
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
    async saveScheme(userId, schemeId) {
        const scheme = await this.prisma.scheme.findUnique({ where: { id: schemeId } });
        if (!scheme) {
            throw new common_1.NotFoundException('Scheme not found');
        }
        const savedScheme = await this.prisma.savedScheme.create({
            data: {
                userId,
                schemeId,
                status: client_1.ApplicationStatus.TODO,
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
    async updateApplicationStatus(savedSchemeId, status) {
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
    async toggleChecklistItem(actionPlanId, itemName, isCompleted) {
        const item = await this.prisma.checklistItem.findFirst({
            where: { actionPlanId, name: itemName },
        });
        if (!item) {
            throw new common_1.NotFoundException('Checklist item not found');
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
    async getCitizenProfileSummary(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const activeApplications = await this.prisma.savedScheme.count({
            where: { userId, status: { not: client_1.ApplicationStatus.APPROVED } }
        });
        return { user, activeApplications };
    }
    async purgeCitizenPersonalData(userId) {
        try {
            await this.prisma.user.delete({ where: { id: userId } });
            return true;
        }
        catch (e) {
            return false;
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map