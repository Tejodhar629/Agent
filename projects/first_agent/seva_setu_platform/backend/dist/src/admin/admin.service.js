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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlatformMetrics(userId, role) {
        if (role !== client_1.Role.ADMIN) {
            throw new common_1.UnauthorizedException('Only admins can view platform metrics');
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
            dailyActiveUsers: Math.floor(totalUsers * 0.1),
            totalApplicationsTracked: totalApplications,
            topSearchedSchemes: topSchemes,
        };
    }
    async updateScheme(schemeId, input, role) {
        if (role !== client_1.Role.ADMIN && role !== client_1.Role.EDITOR) {
            throw new common_1.UnauthorizedException('Not authorized to update schemes');
        }
        const scheme = await this.prisma.scheme.findUnique({ where: { id: schemeId } });
        if (!scheme) {
            throw new common_1.NotFoundException('Scheme not found');
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map