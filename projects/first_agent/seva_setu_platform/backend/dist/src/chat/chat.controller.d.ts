import { ChatService, ChatQueryRequest, ChatQueryResponse } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    private readonly logger;
    constructor(chatService: ChatService);
    queryConversationalAgent(payload: ChatQueryRequest): Promise<ChatQueryResponse>;
    getSpecificCitation(messageId: string): Promise<any>;
    submitConversationalFeedback(payload: {
        messageId: string;
        rating: 'THUMBS_UP' | 'THUMBS_DOWN';
        comments?: string;
    }): Promise<any>;
}
