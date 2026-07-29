import { Controller, Post, Body, Sse, MessageEvent, UseGuards, Req } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('chat')
export class AiController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('completions')
  @Sse()
  async chatCompletions(
    @CurrentUser() user: any,
    @Body('sessionId') sessionId: string,
    @Body('messages') messages: any[],
    @Body('language') language: string,
  ): Promise<Observable<MessageEvent>> {
    // Extract the latest user query from the messages array
    // Assuming messages is an array of { role: 'user' | 'assistant', content: string }
    let query = '';
    const history = [];

    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        query = lastMessage.content;
      }
      // Everything except the last query becomes chat history
      history.push(...messages.slice(0, messages.length - 1));
    }

    // In a real application, you would fetch the full hydrated User Profile 
    // from Prisma here to feed into the RAG engine for pre-filtering (state, occupation).
    const userProfile = { 
      id: user.sub, 
      role: user.role,
      state: 'Maharashtra', // Example stub matching RAG filtering
      occupation: 'Farmer'  // Example stub matching RAG filtering
    };

    // Obtain the Langchain Streaming Response
    const stream = await this.chatService.generateChatResponseStream(query, userProfile, history);

    // Map Langchain stream into Server-Sent Events (SSE) stream
    return new Observable((subscriber) => {
      (async () => {
        try {
          for await (const chunk of stream) {
            subscriber.next({ data: { chunk } } as MessageEvent);
          }
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }
}
