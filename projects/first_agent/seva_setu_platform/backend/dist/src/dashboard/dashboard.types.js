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
exports.SavedScheme = exports.ActionPlan = exports.ChecklistItem = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const scheme_types_1 = require("../scheme/scheme.types");
(0, graphql_1.registerEnumType)(client_1.ApplicationStatus, {
    name: 'ApplicationStatus',
});
let ChecklistItem = class ChecklistItem {
};
exports.ChecklistItem = ChecklistItem;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ChecklistItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChecklistItem.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ChecklistItem.prototype, "isCompleted", void 0);
exports.ChecklistItem = ChecklistItem = __decorate([
    (0, graphql_1.ObjectType)()
], ChecklistItem);
let ActionPlan = class ActionPlan {
};
exports.ActionPlan = ActionPlan;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ActionPlan.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], ActionPlan.prototype, "steps", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], ActionPlan.prototype, "rejectionReasons", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ChecklistItem]),
    __metadata("design:type", Array)
], ActionPlan.prototype, "checklist", void 0);
exports.ActionPlan = ActionPlan = __decorate([
    (0, graphql_1.ObjectType)()
], ActionPlan);
let SavedScheme = class SavedScheme {
};
exports.SavedScheme = SavedScheme;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SavedScheme.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => scheme_types_1.Scheme),
    __metadata("design:type", scheme_types_1.Scheme)
], SavedScheme.prototype, "scheme", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.ApplicationStatus),
    __metadata("design:type", String)
], SavedScheme.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => ActionPlan, { nullable: true }),
    __metadata("design:type", ActionPlan)
], SavedScheme.prototype, "actionPlan", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SavedScheme.prototype, "savedAt", void 0);
exports.SavedScheme = SavedScheme = __decorate([
    (0, graphql_1.ObjectType)()
], SavedScheme);
//# sourceMappingURL=dashboard.types.js.map