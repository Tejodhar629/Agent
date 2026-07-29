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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const consultation_service_1 = require("./consultation.service");
const consultation_types_1 = require("./consultation.types");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let ConsultationResolver = class ConsultationResolver {
    constructor(consultationService) {
        this.consultationService = consultationService;
    }
    async getConsultants(specialty, state) {
        return this.consultationService.getConsultants(specialty, state);
    }
    async getConsultationDetails(id) {
        const c = await this.consultationService.getConsultationDetails(id);
        if (!c)
            return null;
        return {
            ...c,
            scheduledAt: c.scheduledAt.toISOString(),
        };
    }
    async bookConsultation(user, consultantId, scheduledAt) {
        const c = await this.consultationService.bookConsultation(user.sub, consultantId, scheduledAt);
        return {
            ...c,
            scheduledAt: c.scheduledAt.toISOString(),
        };
    }
    async cancelConsultation(user, consultationId) {
        const c = await this.consultationService.cancelConsultation(consultationId, user.sub);
        return {
            ...c,
            scheduledAt: c.scheduledAt.toISOString(),
        };
    }
};
exports.ConsultationResolver = ConsultationResolver;
__decorate([
    (0, graphql_1.Query)(() => [consultation_types_1.Consultant], { name: 'getConsultants' }),
    __param(0, (0, graphql_1.Args)('specialty', { nullable: true })),
    __param(1, (0, graphql_1.Args)('state', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConsultationResolver.prototype, "getConsultants", null);
__decorate([
    (0, graphql_1.Query)(() => consultation_types_1.Consultation, { name: 'getConsultationDetails', nullable: true }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConsultationResolver.prototype, "getConsultationDetails", null);
__decorate([
    (0, graphql_1.Mutation)(() => consultation_types_1.Consultation),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('consultantId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('scheduledAt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ConsultationResolver.prototype, "bookConsultation", null);
__decorate([
    (0, graphql_1.Mutation)(() => consultation_types_1.Consultation),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('consultationId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConsultationResolver.prototype, "cancelConsultation", null);
exports.ConsultationResolver = ConsultationResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [consultation_service_1.ConsultationService])
], ConsultationResolver);
//# sourceMappingURL=consultation.resolver.js.map