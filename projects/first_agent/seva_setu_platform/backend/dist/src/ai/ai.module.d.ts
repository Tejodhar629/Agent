import { OnModuleInit } from '@nestjs/common';
import { RAGService } from './rag.service';
export declare class AiModule implements OnModuleInit {
    private readonly ragService;
    private readonly logger;
    constructor(ragService: RAGService);
    onModuleInit(): Promise<void>;
}
