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
var BusinessController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessController = void 0;
const common_1 = require("@nestjs/common");
const business_service_1 = require("./business.service");
let BusinessController = BusinessController_1 = class BusinessController {
    constructor(businessService) {
        this.businessService = businessService;
        this.logger = new common_1.Logger(BusinessController_1.name);
    }
    async generateBlog(payload) {
        if (!payload.schemeId || !payload.targetLanguage || !payload.stateScope) {
            throw new common_1.BadRequestException('schemeId, targetLanguage, and stateScope are required parameters.');
        }
        try {
            return await this.businessService.generateSeoBlog(payload);
        }
        catch (e) {
            this.logger.error(`Failed to generate SEO blog piece: ${e.message}`);
            throw new common_1.InternalServerErrorException(e.message || 'Internal server error while compiling dynamic sitemap blogs.');
        }
    }
    async sendNotification(payload) {
        if (!payload.userId || !payload.recipientMobile || !payload.messageTemplate || !payload.channel) {
            throw new common_1.BadRequestException('userId, recipientMobile, messageTemplate, and channel are required.');
        }
        try {
            return await this.businessService.sendNotification(payload);
        }
        catch (e) {
            this.logger.error(`Bilingual notification dispatcher failed: ${e.message}`);
            throw new common_1.InternalServerErrorException('Failed to process message dispatcher queue.');
        }
    }
    async logTelemetry(payload) {
        if (!payload.visitorSessionToken || !payload.eventAction || !payload.elementCategory) {
            throw new common_1.BadRequestException('visitorSessionToken, eventAction, and elementCategory are required.');
        }
        try {
            return await this.businessService.logTelemetryEvent(payload);
        }
        catch (e) {
            this.logger.error(`Telemetry logger failure: ${e.message}`);
            throw new common_1.InternalServerErrorException('Telemetry analytics record aborted.');
        }
    }
    async redeemReferral(referrerId, refereeId) {
        if (!referrerId || !refereeId) {
            throw new common_1.BadRequestException('Both referrerId and refereeId parameters are required in request body.');
        }
        return await this.businessService.processReferral(referrerId, refereeId);
    }
    async handleRazorpayWebhook(signature, payload) {
        if (!signature) {
            this.logger.warn('Razorpay webhook called without explicit header signature credentials.');
            throw new common_1.BadRequestException('Missing x-razorpay-signature validation header.');
        }
        const rawPayloadString = JSON.stringify(payload);
        try {
            return await this.businessService.verifyAndProcessRazorpayPayment(signature, rawPayloadString);
        }
        catch (e) {
            this.logger.error(`Razorpay signature verification processing failed: ${e.message}`);
            throw e;
        }
    }
    async bookConsultant(payload) {
        if (!payload.userId || !payload.expertId || !payload.bookingDate || !payload.amountToPay) {
            throw new common_1.BadRequestException('userId, expertId, bookingDate, and amountToPay are mandatory fields.');
        }
        return await this.businessService.createConsultancyBooking(payload);
    }
    async locateCsc(latitude, longitude, maxRadiusKm) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const radius = maxRadiusKm ? parseFloat(maxRadiusKm) : undefined;
        if (isNaN(lat) || isNaN(lng)) {
            throw new common_1.BadRequestException('latitude and longitude parameters must be valid float coordinates.');
        }
        try {
            return await this.businessService.findClosestCscCentres({
                latitude: lat,
                longitude: lng,
                maxRadiusKm: radius
            });
        }
        catch (e) {
            this.logger.error(`Haversine location lookup failed: ${e.message}`);
            throw new common_1.InternalServerErrorException('Failed to compute proximity geolocation matrices.');
        }
    }
};
exports.BusinessController = BusinessController;
__decorate([
    (0, common_1.Post)('blog/generate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "generateBlog", null);
__decorate([
    (0, common_1.Post)('notification/send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Post)('telemetry/log'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "logTelemetry", null);
__decorate([
    (0, common_1.Post)('referral/redeem'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('referrerId')),
    __param(1, (0, common_1.Body)('refereeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "redeemReferral", null);
__decorate([
    (0, common_1.Post)('razorpay/webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)('x-razorpay-signature')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "handleRazorpayWebhook", null);
__decorate([
    (0, common_1.Post)('consultancy/book'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "bookConsultant", null);
__decorate([
    (0, common_1.Get)('csc/locate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('latitude')),
    __param(1, (0, common_1.Query)('longitude')),
    __param(2, (0, common_1.Query)('maxRadiusKm')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "locateCsc", null);
exports.BusinessController = BusinessController = BusinessController_1 = __decorate([
    (0, common_1.Controller)('business'),
    __metadata("design:paramtypes", [business_service_1.BusinessService])
], BusinessController);
//# sourceMappingURL=business.controller.js.map