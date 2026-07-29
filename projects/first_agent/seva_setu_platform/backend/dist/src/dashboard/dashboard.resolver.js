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
exports.DashboardResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const dashboard_types_1 = require("./dashboard.types");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let DashboardResolver = class DashboardResolver {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async mySavedSchemes(user) {
        const schemes = await this.dashboardService.getMySavedSchemes(user.sub);
        return schemes.map(ss => ({
            ...ss,
            savedAt: ss.savedAt.toISOString(),
            scheme: {
                ...ss.scheme,
                tags: ss.scheme.tags || [],
            },
        }));
    }
    async saveScheme(user, schemeId) {
        const ss = await this.dashboardService.saveScheme(user.sub, schemeId);
        return {
            ...ss,
            savedAt: ss.savedAt.toISOString(),
        };
    }
    async updateApplicationStatus(savedSchemeId, status) {
        const ss = await this.dashboardService.updateApplicationStatus(savedSchemeId, status);
        return {
            ...ss,
            savedAt: ss.savedAt.toISOString(),
        };
    }
    async toggleChecklistItem(actionPlanId, itemName, isCompleted) {
        return this.dashboardService.toggleChecklistItem(actionPlanId, itemName, isCompleted);
    }
};
exports.DashboardResolver = DashboardResolver;
__decorate([
    (0, graphql_1.Query)(() => [dashboard_types_1.SavedScheme], { name: 'mySavedSchemes' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardResolver.prototype, "mySavedSchemes", null);
__decorate([
    (0, graphql_1.Mutation)(() => dashboard_types_1.SavedScheme),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('schemeId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DashboardResolver.prototype, "saveScheme", null);
__decorate([
    (0, graphql_1.Mutation)(() => dashboard_types_1.SavedScheme),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('savedSchemeId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('status', { type: () => client_1.ApplicationStatus })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardResolver.prototype, "updateApplicationStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => dashboard_types_1.ActionPlan),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, graphql_1.Args)('actionPlanId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('itemName')),
    __param(2, (0, graphql_1.Args)('isCompleted')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean]),
    __metadata("design:returntype", Promise)
], DashboardResolver.prototype, "toggleChecklistItem", null);
exports.DashboardResolver = DashboardResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardResolver);
//# sourceMappingURL=dashboard.resolver.js.map