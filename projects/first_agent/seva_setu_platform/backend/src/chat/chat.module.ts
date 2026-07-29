import { Module } from '@nestjs/common';
import { BhashiniService } from './bhashini.service';
import { RagService } from './rag.service';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [BhashiniService, RagService, ChatService],
  exports: [BhashiniService, RagService, ChatService]
})
export class ChatModule {}
