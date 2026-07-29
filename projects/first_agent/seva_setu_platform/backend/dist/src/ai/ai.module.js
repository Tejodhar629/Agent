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
var AiModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./ai.controller");
const chat_service_1 = require("./chat.service");
const rag_service_1 = require("./rag.service");
const auth_module_1 = require("../auth/auth.module");
let AiModule = AiModule_1 = class AiModule {
    constructor(ragService) {
        this.ragService = ragService;
        this.logger = new common_1.Logger(AiModule_1.name);
    }
    async onModuleInit() {
        this.logger.log('Initializing Vector Store for RAG Pipeline...');
        const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/seva_setu_db?schema=public';
        const config = { connectionString: dbUrl };
        try {
            this.logger.log('RAG Vector Store initialization stub complete.');
        }
        catch (e) {
            this.logger.warn('Could not initialize PGVectorStore. Please ensure pgvector is installed in Postgres.');
        }
    }
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = AiModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [ai_controller_1.AiController],
        providers: [chat_service_1.ChatService, rag_service_1.RAGService],
        exports: [chat_service_1.ChatService, rag_service_1.RAGService],
    }),
    __metadata("design:paramtypes", [rag_service_1.RAGService])
], AiModule);
//# sourceMappingURL=ai.module.js.map