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
var SchemeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemeController = void 0;
const common_1 = require("@nestjs/common");
const scheme_service_1 = require("./scheme.service");
let SchemeController = SchemeController_1 = class SchemeController {
    constructor(schemeService) {
        this.schemeService = schemeService;
        this.logger = new common_1.Logger(SchemeController_1.name);
    }
    async getSchemes(category, stateScope, search) {
        this.logger.log('Executing GET /api/v1/schemes endpoint...');
        return this.schemeService.findAll(category, stateScope, search);
    }
    async getScholarships(stateScope, search) {
        this.logger.log('Executing GET /api/v1/schemes/scholarships endpoint...');
        return this.schemeService.findAll('EDUCATION', stateScope, search);
    }
    async getPensions(stateScope, search) {
        this.logger.log('Executing GET /api/v1/schemes/pensions endpoint...');
        return this.schemeService.findAll('PENSION_WELFARE', stateScope, search);
    }
    async getSchemeById(id) {
        this.logger.log(`Executing GET /api/v1/schemes/${id} details endpoint...`);
        return this.schemeService.findOne(id);
    }
    async matchSchemesForUser(userId, profileOverride) {
        this.logger.log(`Executing POST /api/v1/schemes/matching/${userId} calculations...`);
        const resolvedProfile = {
            age: profileOverride?.age ?? 35,
            state: profileOverride?.state ?? 'KARNATAKA',
            annualIncome: profileOverride?.annualIncome ?? 75000,
            gender: profileOverride?.gender ?? 'MALE',
            category: profileOverride?.category ?? 'OBC',
            occupation: profileOverride?.occupation ?? 'Farmer',
            isStudent: profileOverride?.isStudent ?? false,
            isDisable: profileOverride?.isDisable ?? false,
            hasBusiness: profileOverride?.hasBusiness ?? false,
        };
        if (resolvedProfile.age < 0 || resolvedProfile.annualIncome < 0) {
            throw new common_1.BadRequestException('Invalid demographic inputs. Age and Annual Income must be non-negative.');
        }
        return this.schemeService.findMatchingSchemes(resolvedProfile);
    }
    async saveScheme(schemeId, userId) {
        this.logger.log(`Executing POST /api/v1/schemes/${schemeId}/save request for user: ${userId}...`);
        if (!userId) {
            throw new common_1.BadRequestException('Required parameter "userId" is missing in the request payload.');
        }
        return this.schemeService.saveScheme(userId, schemeId);
    }
    async unsaveScheme(schemeId, userId) {
        this.logger.log(`Executing DELETE /api/v1/schemes/${schemeId}/unsave request for user: ${userId}...`);
        if (!userId) {
            throw new common_1.BadRequestException('Required query parameter "userId" is missing.');
        }
        const success = await this.schemeService.unsaveScheme(userId, schemeId);
        return {
            status: 'SUCCESS',
            message: 'Scheme successfully removed from the saved catalog.',
            removed: success
        };
    }
};
exports.SchemeController = SchemeController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('stateScope')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SchemeController.prototype, "getSchemes", null);
__decorate([
    (0, common_1.Get)('scholarships'),
    __param(0, (0, common_1.Query)('stateScope')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SchemeController.prototype, "getScholarships", null);
__decorate([
    (0, common_1.Get)('pensions'),
    __param(0, (0, common_1.Query)('stateScope')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SchemeController.prototype, "getPensions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchemeController.prototype, "getSchemeById", null);
__decorate([
    (0, common_1.Post)('matching/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SchemeController.prototype, "matchSchemesForUser", null);
__decorate([
    (0, common_1.Post)(':id/save'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SchemeController.prototype, "saveScheme", null);
__decorate([
    (0, common_1.Delete)(':id/unsave'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SchemeController.prototype, "unsaveScheme", null);
exports.SchemeController = SchemeController = SchemeController_1 = __decorate([
    (0, common_1.Controller)('api/v1/schemes'),
    __metadata("design:paramtypes", [scheme_service_1.SchemeService])
], SchemeController);
//# sourceMappingURL=scheme.controller.js.map