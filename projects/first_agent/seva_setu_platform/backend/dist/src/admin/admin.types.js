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
exports.SchemeInput = exports.PlatformMetrics = void 0;
const graphql_1 = require("@nestjs/graphql");
const scheme_types_1 = require("../scheme/scheme.types");
let PlatformMetrics = class PlatformMetrics {
};
exports.PlatformMetrics = PlatformMetrics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PlatformMetrics.prototype, "dailyActiveUsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PlatformMetrics.prototype, "totalApplicationsTracked", void 0);
__decorate([
    (0, graphql_1.Field)(() => [scheme_types_1.Scheme]),
    __metadata("design:type", Array)
], PlatformMetrics.prototype, "topSearchedSchemes", void 0);
exports.PlatformMetrics = PlatformMetrics = __decorate([
    (0, graphql_1.ObjectType)()
], PlatformMetrics);
let SchemeInput = class SchemeInput {
};
exports.SchemeInput = SchemeInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SchemeInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SchemeInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SchemeInput.prototype, "ministry", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SchemeInput.prototype, "officialLink", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SchemeInput.prototype, "eligibilityCriteria", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SchemeInput.prototype, "benefits", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], SchemeInput.prototype, "documentsRequired", void 0);
exports.SchemeInput = SchemeInput = __decorate([
    (0, graphql_1.InputType)()
], SchemeInput);
//# sourceMappingURL=admin.types.js.map