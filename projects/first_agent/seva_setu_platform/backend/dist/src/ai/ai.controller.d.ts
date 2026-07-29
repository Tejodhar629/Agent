import { MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
export declare class AiController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chatCompletions(user: any, sessionId: string, messages: any[], language: string): Promise<Observable<MessageEvent>>;
}
