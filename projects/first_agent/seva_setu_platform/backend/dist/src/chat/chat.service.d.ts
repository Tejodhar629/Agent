import { BhashiniService } from './bhashini.service';
import { RagService } from './rag.service';
export interface ChatQueryRequest {
    conversationId?: string;
    userId: string;
    userQuery: string;
    sourceLang: string;
    voiceInput?: boolean;
    audioContentBase64?: string;
}
export interface ChatQueryResponse {
    conversationId: string;
    messageId: string;
    detectedLanguage: string;
    intent: string;
    assistantResponseNative: string;
    assistantResponseEnglish: string;
    audioResponseBase64?: string;
    citations: string[];
    requiresOcr: boolean;
    entities: {
        geographic_scope: string | null;
        scheme_name: string | null;
        demographics: {
            age: number | null;
            income: number | null;
            occupation: string | null;
        };
    };
}
export declare class ChatService {
    private readonly bhashiniService;
    private readonly ragService;
    private readonly logger;
    private readonly openaiApiKey;
    constructor(bhashiniService: BhashiniService, ragService: RagService);
    processUserQuery(payload: ChatQueryRequest): Promise<ChatQueryResponse>;
    private executeRouterAgent;
    private executeSynthesisAgent;
    private enforceOutputGuardrails;
    validateAndRedactPii(text: string): string;
    private heuristicRouterFallback;
    private heuristicSynthesisFallback;
}
