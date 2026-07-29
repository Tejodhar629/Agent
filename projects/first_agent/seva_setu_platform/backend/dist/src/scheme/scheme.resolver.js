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
exports.SchemeResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const scheme_types_1 = require("./scheme.types");
const scheme_service_1 = require("./scheme.service");
const common_1 = require("@nestjs/common");
let SchemeResolver = class SchemeResolver {
    constructor(schemeService) {
        this.schemeService = schemeService;
    }
    async searchSchemes(query, state, tags) {
        const category = tags && tags.length > 0 ? tags[0] : undefined;
        const backendSchemes = await this.schemeService.findAll(category, state, query);
        return backendSchemes.map((s) => ({
            id: s.id,
            title: s.name,
            description: s.description,
            ministry: s.ministry,
            tags: s.category ? [s.category] : [],
            officialLink: s.officialUrl,
            eligibilityCriteria: JSON.stringify(s.eligibilityRules),
            benefits: s.dbtAmount ? `Financial assistance up to Rs ${s.dbtAmount}` : 'Non-monetary benefits',
            documentsRequired: s.documentChecklist || [],
        }));
    }
    async getSchemeById(id) {
        try {
            const s = await this.schemeService.findOne(id);
            if (!s) {
                return null;
            }
            return {
                id: s.id,
                title: s.name,
                description: s.description,
                ministry: s.ministry,
                tags: s.category ? [s.category] : [],
                officialLink: s.officialUrl,
                eligibilityCriteria: JSON.stringify(s.eligibilityRules),
                benefits: s.dbtAmount ? `Financial assistance up to Rs ${s.dbtAmount}` : 'Non-monetary benefits',
                documentsRequired: s.documentChecklist || [],
            };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Scheme with id ${id} not found.`);
        }
    }
};
exports.SchemeResolver = SchemeResolver;
__decorate([
    (0, graphql_1.Query)(() => [scheme_types_1.Scheme], { name: 'searchSchemes' }),
    __param(0, (0, graphql_1.Args)('query', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Args)('state', { type: () => String, nullable: true })),
    __param(2, (0, graphql_1.Args)('tags', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], SchemeResolver.prototype, "searchSchemes", null);
__decorate([
    (0, graphql_1.Query)(() => scheme_types_1.Scheme, { name: 'getSchemeById', nullable: true }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchemeResolver.prototype, "getSchemeById", null);
exports.SchemeResolver = SchemeResolver = __decorate([
    (0, graphql_1.Resolver)(() => scheme_types_1.Scheme),
    __metadata("design:paramtypes", [scheme_service_1.SchemeService])
], SchemeResolver);
//# sourceMappingURL=scheme.resolver.js.map