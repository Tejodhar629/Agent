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
exports.Consultation = exports.Consultant = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const user_types_1 = require("../user/user.types");
(0, graphql_1.registerEnumType)(client_1.ConsultationStatus, {
    name: 'ConsultationStatus',
});
let Consultant = class Consultant {
};
exports.Consultant = Consultant;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Consultant.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_types_1.User),
    __metadata("design:type", user_types_1.User)
], Consultant.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], Consultant.prototype, "specialties", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], Consultant.prototype, "rating", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Consultant.prototype, "hourlyRate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Consultant.prototype, "isVerified", void 0);
exports.Consultant = Consultant = __decorate([
    (0, graphql_1.ObjectType)()
], Consultant);
let Consultation = class Consultation {
};
exports.Consultation = Consultation;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Consultation.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_types_1.User),
    __metadata("design:type", user_types_1.User)
], Consultation.prototype, "citizen", void 0);
__decorate([
    (0, graphql_1.Field)(() => Consultant),
    __metadata("design:type", Consultant)
], Consultation.prototype, "consultant", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Consultation.prototype, "scheduledAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.ConsultationStatus),
    __metadata("design:type", String)
], Consultation.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Consultation.prototype, "meetingLink", void 0);
exports.Consultation = Consultation = __decorate([
    (0, graphql_1.ObjectType)()
], Consultation);
//# sourceMappingURL=consultation.types.js.map