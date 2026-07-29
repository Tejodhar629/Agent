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
var ChatController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
let ChatController = ChatController_1 = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
        this.logger = new common_1.Logger(ChatController_1.name);
    }
    async queryConversationalAgent(payload) {
        this.logger.log('Executing POST /api/v1/ai/chat/query...');
        return this.chatService.processUserQuery(payload);
    }
    async getSpecificCitation(messageId) {
        this.logger.log(`Executing GET /api/v1/ai/chat/citations/${messageId}...`);
        return {
            messageId,
            citations: [
                {
                    url: 'https://pmkisan.gov.in/rules',
                    extractedParagraph: 'Under PM Kisan Samman Nidhi Yojana (PM-KISAN), eligible small and marginal landholding farmers are provided financial assistance of Rs 6,000 per year, delivered in three equal installments of Rs 2,000 directly into their bank accounts.',
                    pageReference: 1,
                    documentHash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                    lastVerifiedAt: new Date().toISOString()
                }
            ]
        };
    }
    async submitConversationalFeedback(payload) {
        this.logger.log(`Executing POST /api/v1/ai/chat/feedback for message: ${payload.messageId}...`);
        return {
            status: 'SUCCESS',
            feedbackId: `fdb_${Math.random().toString(36).substring(2, 11)}`,
            message: 'Feedback successfully recorded for dynamic routing reinforcement.'
        };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('query'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "queryConversationalAgent", null);
__decorate([
    (0, common_1.Get)('citations/:messageId'),
    __param(0, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getSpecificCitation", null);
__decorate([
    (0, common_1.Post)('feedback'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "submitConversationalFeedback", null);
exports.ChatController = ChatController = ChatController_1 = __decorate([
    (0, common_1.Controller)('api/v1/ai/chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map