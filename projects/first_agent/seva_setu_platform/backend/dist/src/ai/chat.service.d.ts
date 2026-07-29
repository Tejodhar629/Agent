import { RAGService } from "./rag.service";
export declare class ChatService {
    private primaryLlm;
    private fallbackLlm;
    private ragService;
    constructor(ragService: RAGService);
    generateChatResponseStream(userQuery: string, userProfile: any, chatHistory?: any[]): Promise<import("@langchain/core/utils/stream").IterableReadableStream<string>>;
}
