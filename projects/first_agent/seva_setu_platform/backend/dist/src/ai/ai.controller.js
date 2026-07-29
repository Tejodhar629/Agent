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
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let AiController = class AiController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async chatCompletions(user, sessionId, messages, language) {
        let query = '';
        const history = [];
        if (messages && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'user') {
                query = lastMessage.content;
            }
            history.push(...messages.slice(0, messages.length - 1));
        }
        const userProfile = {
            id: user.sub,
            role: user.role,
            state: 'Maharashtra',
            occupation: 'Farmer'
        };
        const stream = await this.chatService.generateChatResponseStream(query, userProfile, history);
        return new rxjs_1.Observable((subscriber) => {
            (async () => {
                try {
                    for await (const chunk of stream) {
                        subscriber.next({ data: { chunk } });
                    }
                    subscriber.complete();
                }
                catch (error) {
                    subscriber.error(error);
                }
            })();
        });
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('completions'),
    (0, common_1.Sse)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('sessionId')),
    __param(2, (0, common_1.Body)('messages')),
    __param(3, (0, common_1.Body)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chatCompletions", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], AiController);
//# sourceMappingURL=ai.controller.js.map